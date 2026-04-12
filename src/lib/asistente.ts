/**
 * asistente.ts — Motor de asistente local para la Farmacoteca HRDR
 *
 * Interpreta preguntas en lenguaje natural en español y responde
 * ÚNICAMENTE con datos del archivo farmacos.json.
 *
 * Sin dependencias externas. Sin API. Sin internet.
 *
 * ─── EJEMPLOS DE USO ───────────────────────────────────────────────────────
 *
 * procesarConsulta("¿Cuál es la dosis de vancomicina?", farmacos)
 *  → Devuelve ficha completa de Vancomicina con todos sus campos
 *
 * procesarConsulta("¿Cuánto tiempo es estable el meropenem a temperatura ambiente?", farmacos)
 *  → "⏱️ MEROPENEM\nEstabilidad: 2hrs T° ambiente y 24hrs refrigerada"
 *
 * procesarConsulta("qué fármacos debo proteger de la luz", farmacos)
 *  → Lista de fármacos con alerta proteger_luz
 *
 * procesarConsulta("lista los antifúngicos", farmacos)
 *  → Lista de todos los antifúngicos con frecuencia
 *
 * procesarConsulta("cuáles son todos los antibacterianos", farmacos)
 *  → Lista de todos los antibacterianos agrupados
 *
 * procesarConsulta("cómo se reconstituye el imipenem", farmacos)
 *  → Reconstitución específica de Imipenem + Cilastatina
 *
 * procesarConsulta("vanco", farmacos)
 *  → Ficha completa de Vancomicina (abreviación reconocida)
 *
 * procesarConsulta("cuál es el clima hoy", farmacos)
 *  → Declina amablemente (fuera de alcance)
 *
 * ────────────────────────────────────────────────────────────────────────────
 */

import { Farmaco, TipoAlerta, CategoriaFarmaco } from "@/types/farmaco";

// ══════════════════════════════════════════════════════════════════
// NORMALIZACIÓN
// ══════════════════════════════════════════════════════════════════

/** Convierte texto a minúsculas, quita tildes y signos de puntuación */
function normalizar(texto: string): string {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // quitar tildes
        .replace(/[¿?¡!.,;:()"']/g, " ") // quitar puntuación
        .replace(/\s+/g, " ")
        .trim();
}

// ══════════════════════════════════════════════════════════════════
// ABREVIACIONES COMUNES
// ══════════════════════════════════════════════════════════════════

const ABREVIACIONES: Record<string, string> = {
    vanco: "vancomicina",
    metro: "metronidazol",
    "pip-tazo": "piperacilina",
    "pip tazo": "piperacilina",
    tazobactam: "piperacilina",
    "tazo-pip": "piperacilina",
    ambi: "anfotericina b liposomal",
    ampho: "anfotericina",
    "l-ampho": "anfotericina b complejo",
    cipro: "ciprofloxacino",
    imipenem: "imipenem",
    mero: "meropenem",
    "amp-sul": "ampicilina sulbactam",
    "ampicilina-sulbactam": "ampicilina sulbactam",
    linezolid: "linezolid",
    ceftri: "ceftriaxona",
    cefta: "ceftazidima",
    cefaz: "cefazolina",
    cefoto: "cefotaxima",
    aciclo: "aciclovir",
    ganci: "ganciclovir",
    fluco: "fluconazol",
    vori: "voriconazol",
    caspo: "caspofungina",
    anidula: "anidulafungina",
    clinda: "clindamicina",
    clox: "cloxacilina",
    cotri: "cotrimoxazol",
    colist: "colistin",
    levo: "levofloxacino",
    amika: "amikacina",
    genta: "gentamicina",
    ampicil: "ampicilina",
    penicil: "penicilina",
    ertapen: "ertapenem",
    anfotericina: "anfotericina",
};

/** Reemplaza abreviaciones conocidas en la pregunta normalizada */
function expandirAbreviaciones(texto: string): string {
    let resultado = texto;
    for (const [abrev, completo] of Object.entries(ABREVIACIONES)) {
        if (resultado.includes(abrev)) {
            resultado = resultado.replace(new RegExp(abrev, "g"), completo);
        }
    }
    return resultado;
}

// ══════════════════════════════════════════════════════════════════
// DETECCIÓN DE INTENCIÓN
// ══════════════════════════════════════════════════════════════════

type Intencion =
    | "BUSCAR_FARMACO"
    | "BUSCAR_POR_ALERTA"
    | "BUSCAR_POR_CATEGORIA"
    | "BUSCAR_POR_SOLVENTE"
    | "BUSCAR_ESTABILIDAD"
    | "BUSCAR_VELOCIDAD"
    | "BUSCAR_RECONSTITUCION"
    | "LISTAR_TODO"
    | "COMPARAR"
    | "FUERA_DE_ALCANCE"
    | "DESCONOCIDO";

const PALABRAS_FUERA_ALCANCE = [
    "clima", "temperatura externa", "noticias", "politica", "deporte",
    "futbol", "tenis", "matematicas", "historia", "geografia",
    "receta", "cocina", "pelicula", "musica", "amor", "chiste",
    "quien eres", "como estas", "broma", "juego",
];

const PALABRAS_ALERTA: Record<string, TipoAlerta | TipoAlerta[]> = {
    "proteger luz": "proteger_luz",
    "protegida luz": "proteger_luz",
    "luz": "proteger_luz",
    "refrigerar": ["refrigerar", "refrigerar_viales"],
    "nevera": ["refrigerar", "refrigerar_viales"],
    "frigorifico": ["refrigerar", "refrigerar_viales"],
    "convulsion": "riesgo_convulsion",
    "convulsiones": "riesgo_convulsion",
    "anafilaxis": "anafilaxis",
    "anafilaxia": "anafilaxis",
    "anafilactico": "anafilaxis",
    "shock anafilactico": "anafilaxis",
    "nefrotoxicidad": "nefrotoxicidad",
    "nefrotoxica": "nefrotoxicidad",
    "nefrotoxicidad renal": "nefrotoxicidad",
    "hipotension": "hipotension",
    "hipotensivo": "hipotension",
    "citostatico": "citostatico",
    "citotoxico": "citostatico",
    "pcr": "pcr",
    "paro": "pcr",
    "paro cardiorrespiratorio": "pcr",
    "aditivos": "no_aditivos",
    "homogenizar": "homogenizar",
    "lavar via": "lavar_via",
    "lavar la via": "lavar_via",
    "qt": "qt_prolongado",
    "qt prolongado": "qt_prolongado",
    "transfusion": "transfusion",
    "ajuste renal": "ajuste_renal",
    "velocidad administracion": "velocidad_administracion",
    "verificar solucion": "verificar_solucion",
};

function detectarIntencion(texto: string): Intencion {
    // Fuera de alcance
    if (PALABRAS_FUERA_ALCANCE.some((p) => texto.includes(p))) {
        return "FUERA_DE_ALCANCE";
    }

    if (/listar|lista\b|todos los|cuales son|mostrar todos|dame todos|enumera/.test(texto)) {
        return "LISTAR_TODO";
    }
    if (/diferencia|compara|comparar|versus|\bvs\b/.test(texto)) {
        return "COMPARAR";
    }
    if (/reconstituir|reconstitucion|preparar|disolver|como se prepara|preparacion/.test(texto)) {
        return "BUSCAR_RECONSTITUCION";
    }
    if (/velocidad|tiempo de infusion|cuanto tiempo infundir|tiempo para infundir|pasar en|infundir en/.test(texto)) {
        return "BUSCAR_VELOCIDAD";
    }
    if (/\bestable\b|estabilidad|cuanto dura|cuanto tiempo dura|vence|refrigerado|temperatura ambiente|t° ambiente/.test(texto)) {
        return "BUSCAR_ESTABILIDAD";
    }
    if (/solvente|diluir en|disolver en|\bsf\b|suero fisiol|glucosado|sg5|sg 5/.test(texto)) {
        return "BUSCAR_POR_SOLVENTE";
    }

    // Alertas
    for (const palabraAlerta of Object.keys(PALABRAS_ALERTA)) {
        if (texto.includes(palabraAlerta)) return "BUSCAR_POR_ALERTA";
    }

    // Categoría
    if (/antibacteriano|antibiotico|bacteriano|bacteria|anti-bacteria/.test(texto)) {
        return "BUSCAR_POR_CATEGORIA";
    }
    if (/antifungico|hongo|hongo|fungic|antimicotic|candida/.test(texto)) {
        return "BUSCAR_POR_CATEGORIA";
    }
    if (/antiviral|virus|viral|virico/.test(texto)) {
        return "BUSCAR_POR_CATEGORIA";
    }

    // Búsqueda general de info sobre un fármaco
    if (/dosis|cuanto|cual es|informacion sobre|dime|necesito saber|cuentame|administrar|presentacion|concentracion|frecuencia|cuidado|alerta|ampolla|frasco/.test(texto)) {
        return "BUSCAR_FARMACO";
    }

    return "DESCONOCIDO";
}

// ══════════════════════════════════════════════════════════════════
// EXTRACCIÓN DEL FÁRMACO
// ══════════════════════════════════════════════════════════════════

/** Busca qué fármaco menciona la pregunta usando coincidencia parcial */
function extraerFarmaco(texto: string, farmacos: Farmaco[]): Farmaco | null {
    const textoExpandido = expandirAbreviaciones(texto);

    // 1. Buscar por nombre normalizado (coincidencia completa primero)
    for (const f of farmacos) {
        const nombreNorm = normalizar(f.nombre);
        if (textoExpandido.includes(nombreNorm)) return f;
    }

    // 2. Buscar por id
    for (const f of farmacos) {
        const idNorm = normalizar(f.id);
        if (textoExpandido.includes(idNorm)) return f;
    }

    // 3. Coincidencia parcial por palabras significativas (>= 4 letras)
    const palabras = textoExpandido.split(/\s+/).filter((p) => p.length >= 4);
    let mejorCoincidencia: Farmaco | null = null;
    let mejorScore = 0;

    for (const farmaco of farmacos) {
        const nombreNorm = normalizar(farmaco.nombre);
        let score = 0;
        for (const palabra of palabras) {
            if (nombreNorm.includes(palabra)) {
                score += palabra.length; // mayor peso a palabras más largas
            }
        }
        if (score > mejorScore) {
            mejorScore = score;
            mejorCoincidencia = farmaco;
        }
    }

    // Solo retornar si hay una coincidencia suficientemente fuerte
    return mejorScore >= 4 ? mejorCoincidencia : null;
}

// ══════════════════════════════════════════════════════════════════
// DETECTAR ALERTA BUSCADA
// ══════════════════════════════════════════════════════════════════

function detectarAlertaBuscada(texto: string): TipoAlerta[] {
    const alertas: TipoAlerta[] = [];
    for (const [palabraClave, tipoAlerta] of Object.entries(PALABRAS_ALERTA)) {
        if (texto.includes(palabraClave)) {
            const arr = Array.isArray(tipoAlerta) ? tipoAlerta : [tipoAlerta];
            for (const a of arr) {
                if (!alertas.includes(a)) alertas.push(a);
            }
        }
    }
    return alertas;
}

// ══════════════════════════════════════════════════════════════════
// DETECTAR CATEGORÍA BUSCADA
// ══════════════════════════════════════════════════════════════════

function detectarCategoria(texto: string): CategoriaFarmaco | null {
    if (/antibacteriano|antibiotico|bacteriano|bacteria/.test(texto)) return "antibacteriano";
    if (/antifungico|hongo|fungic|antimicotic|candida/.test(texto)) return "antifungico";
    if (/antiviral|virus|viral|virico/.test(texto)) return "antiviral";
    return null;
}

// ══════════════════════════════════════════════════════════════════
// GENERADORES DE RESPUESTA
// ══════════════════════════════════════════════════════════════════

function fichaCompleta(f: Farmaco): string {
    const presentaciones = f.presentacion.join("\n   · ");
    const alertasTexto =
        f.alertas.length > 0 ? f.alertas.join(", ") : "Ninguna registrada";

    return `📋 **${f.nombre}**

💊 **Presentación:**
   · ${presentaciones}
📏 **Dosis:** ${f.dosis}
🗓️ **Dosis/día:** ${f.dosisDia}
⚠️ **Dosis máxima:** ${f.dosisMaxima}
🔁 **Frecuencia:** ${f.frecuencia}
🧪 **Reconstitución:** ${f.reconstitucion}
💧 **Conc. en dilución:** ${f.concentracionDilucion}
🧴 **Solvente:** ${f.solvente}
⏱️ **Estabilidad:** ${f.estabilidad}
💉 **Velocidad de infusión:** ${f.velocidad}
🚨 **Cuidados especiales:** ${f.cuidados !== "---" ? f.cuidados : "Sin cuidados especiales adicionales"}
🏷️ **Alertas:** ${alertasTexto}`;
}

const ETIQUETAS_CATEGORIA: Record<CategoriaFarmaco, string> = {
    antibacteriano: "Antibacterianos",
    antifungico: "Antifúngicos",
    antiviral: "Antivirales",
    aine_analgesico: "AINEs / Analgésicos",
    opioide: "Opioides",
    digestivo: "Digestivo",
    vitamina: "Vitaminas",
    mineral: "Minerales / Electrolitos",
    corticoide: "Corticoides",
    oncologico: "Oncológico",
    "psicofármaco": "Psicofármacos",
};

function listarPorCategoria(farmacos: Farmaco[], cat: CategoriaFarmaco): string {
    const lista = farmacos.filter((f) => f.categoria === cat);
    const encabezado = `🔬 **${ETIQUETAS_CATEGORIA[cat]}** (${lista.length} fármacos)\n`;
    const items = lista
        .map((f) => `  · **${f.nombre}** — ${f.frecuencia}`)
        .join("\n");
    return encabezado + items;
}

function listarTodo(farmacos: Farmaco[]): string {
    const categorias: CategoriaFarmaco[] = ["antibacteriano", "antifungico", "antiviral"];
    const secciones = categorias.map((cat) => {
        const lista = farmacos.filter((f) => f.categoria === cat);
        const items = lista.map((f) => `  · ${f.nombre}`).join("\n");
        return `🔬 **${ETIQUETAS_CATEGORIA[cat]}** (${lista.length}):\n${items}`;
    });
    return `📚 **Farmacoteca HRDR — Lista completa** (${farmacos.length} fármacos)\n\n` + secciones.join("\n\n");
}

function buscarPorAlerta(farmacos: Farmaco[], alertas: TipoAlerta[], textoOriginal: string): string {
    const coincidentes = farmacos.filter((f) =>
        alertas.some((a) => f.alertas.includes(a))
    );

    if (coincidentes.length === 0) {
        return `No encontré fármacos con esa alerta específica en la Farmacoteca HRDR.`;
    }

    const titulo = `⚠️ **Fármacos con alerta relacionada** (${coincidentes.length} encontrados):`;
    const items = coincidentes
        .map((f) => `  · **${f.nombre}**\n    🚨 ${f.cuidados !== "---" ? f.cuidados : "Ver alertas: " + f.alertas.join(", ")}`)
        .join("\n\n");

    return titulo + "\n\n" + items + "\n\n_💡 Recuerda siempre verificar el protocolo institucional._";
}

function buscarPorSolvente(farmacos: Farmaco[], texto: string): string {
    let solvente = "";
    if (/sg5|glucosado|sg 5|dextrosa/.test(texto)) solvente = "SG5%";
    else if (/\bsf\b|suero fisiol|cloruro sodio|nacl/.test(texto)) solvente = "SF";

    if (!solvente) {
        // Listar todos con sus solventes
        const items = farmacos
            .map((f) => `  · **${f.nombre}**: ${f.solvente}`)
            .join("\n");
        return `🧴 **Solventes por fármaco:**\n\n${items}`;
    }

    const coincidentes = farmacos.filter((f) =>
        (f.solvente ?? "").toUpperCase().includes(solvente)
    );

    if (coincidentes.length === 0) {
        return `No encontré fármacos con solvente "${solvente}" en la Farmacoteca HRDR.`;
    }

    const items = coincidentes.map((f) => `  · **${f.nombre}**: ${f.solvente}`).join("\n");
    return `🧴 **Fármacos que se diluyen con ${solvente}** (${coincidentes.length}):\n\n${items}`;
}

function respuestaEstabilidad(f: Farmaco): string {
    return `⏱️ **${f.nombre}**\n\n📌 **Estabilidad:** ${f.estabilidad}`;
}

function respuestaVelocidad(f: Farmaco): string {
    return `💉 **${f.nombre}**\n\n📌 **Velocidad de infusión:** ${f.velocidad}`;
}

function respuestaReconstitucion(f: Farmaco): string {
    return `🧪 **${f.nombre}**\n\n📌 **Reconstitución:** ${f.reconstitucion}\n💧 **Concentración en dilución:** ${f.concentracionDilucion}\n🧴 **Solvente:** ${f.solvente}`;
}

function respuestaComparacion(f1: Farmaco, f2: Farmaco): string {
    return `🔍 **Comparación: ${f1.nombre} vs ${f2.nombre}**

| Campo | ${f1.nombre} | ${f2.nombre} |
|-------|${"-".repeat(f1.nombre.length + 2)}|${"-".repeat(f2.nombre.length + 2)}|
| Dosis | ${f1.dosis} | ${f2.dosis} |
| Frecuencia | ${f1.frecuencia} | ${f2.frecuencia} |
| Solvente | ${f1.solvente} | ${f2.solvente} |
| Estabilidad | ${f1.estabilidad} | ${f2.estabilidad} |
| Velocidad | ${f1.velocidad} | ${f2.velocidad} |`;
}

// ══════════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL — EXPORTADA
// ══════════════════════════════════════════════════════════════════

/**
 * Procesa una pregunta en lenguaje natural y retorna una respuesta
 * construida ÚNICAMENTE con datos de la Farmacoteca HRDR.
 *
 * Es una función pura: mismo input → mismo output.
 */
export function procesarConsulta(pregunta: string, farmacos: Farmaco[]): string {
    if (!pregunta || !pregunta.trim()) {
        return "Por favor escribe tu consulta sobre los fármacos de la Farmacoteca HRDR.";
    }

    const texto = normalizar(pregunta);
    const intencion = detectarIntencion(texto);

    // ── Fuera de alcance ───────────────────────────────────────────
    if (intencion === "FUERA_DE_ALCANCE") {
        return "Solo puedo responder consultas sobre los fármacos de la **Farmacoteca HRDR pediátrica** (< 15 años). Por favor consulta sobre un fármaco específico o una categoría como antibacterianos, antifúngicos o antivirales.";
    }

    // ── Listar todo ────────────────────────────────────────────────
    if (intencion === "LISTAR_TODO") {
        const categoria = detectarCategoria(texto);
        if (categoria) return listarPorCategoria(farmacos, categoria);
        return listarTodo(farmacos);
    }

    // ── Buscar por categoría ───────────────────────────────────────
    if (intencion === "BUSCAR_POR_CATEGORIA") {
        const categoria = detectarCategoria(texto);
        if (categoria) return listarPorCategoria(farmacos, categoria);
        return listarTodo(farmacos);
    }

    // ── Buscar por alerta ──────────────────────────────────────────
    if (intencion === "BUSCAR_POR_ALERTA") {
        const alertas = detectarAlertaBuscada(texto);
        return buscarPorAlerta(farmacos, alertas, texto);
    }

    // ── Buscar por solvente ────────────────────────────────────────
    if (intencion === "BUSCAR_POR_SOLVENTE") {
        const farmaco = extraerFarmaco(texto, farmacos);
        if (farmaco) {
            return `🧴 **${farmaco.nombre}**\n\n📌 **Solvente:** ${farmaco.solvente}\n💧 **Concentración:** ${farmaco.concentracionDilucion}`;
        }
        return buscarPorSolvente(farmacos, texto);
    }

    // ── Estabilidad ────────────────────────────────────────────────
    if (intencion === "BUSCAR_ESTABILIDAD") {
        const farmaco = extraerFarmaco(texto, farmacos);
        if (farmaco) return respuestaEstabilidad(farmaco);
        // Sin fármaco = listar todos ordenados
        const items = farmacos
            .map((f) => `  · **${f.nombre}**: ${f.estabilidad}`)
            .join("\n");
        return `⏱️ **Estabilidad de todos los fármacos:**\n\n${items}`;
    }

    // ── Velocidad ──────────────────────────────────────────────────
    if (intencion === "BUSCAR_VELOCIDAD") {
        const farmaco = extraerFarmaco(texto, farmacos);
        if (farmaco) return respuestaVelocidad(farmaco);
        const items = farmacos
            .map((f) => `  · **${f.nombre}**: ${f.velocidad}`)
            .join("\n");
        return `💉 **Velocidad de infusión de todos los fármacos:**\n\n${items}`;
    }

    // ── Reconstitución ─────────────────────────────────────────────
    if (intencion === "BUSCAR_RECONSTITUCION") {
        const farmaco = extraerFarmaco(texto, farmacos);
        if (farmaco) return respuestaReconstitucion(farmaco);
        return "Por favor indica el nombre del fármaco del que necesitas conocer la reconstitución.";
    }

    // ── Comparación ────────────────────────────────────────────────
    if (intencion === "COMPARAR") {
        // Buscar dos fármacos en la pregunta
        const farmacosMencionados: Farmaco[] = [];
        const textoExpandido = expandirAbreviaciones(texto);

        for (const f of farmacos) {
            const nombreNorm = normalizar(f.nombre);
            const idNorm = normalizar(f.id);
            if (textoExpandido.includes(nombreNorm) || textoExpandido.includes(idNorm)) {
                if (farmacosMencionados.length < 2) farmacosMencionados.push(f);
            }
        }

        // Si encontramos dos, comparar
        if (farmacosMencionados.length >= 2) {
            return respuestaComparacion(farmacosMencionados[0], farmacosMencionados[1]);
        }

        // Si solo uno, mostrar su ficha
        if (farmacosMencionados.length === 1) {
            return fichaCompleta(farmacosMencionados[0]) + "\n\n_Para comparar, menciona los dos fármacos en tu consulta._";
        }

        return "Para comparar fármacos, menciona los nombres de los dos en tu consulta. Ejemplo: 'compara meropenem vs imipenem'";
    }

    // ── Búsqueda general / por nombre ─────────────────────────────
    const farmaco = extraerFarmaco(texto, farmacos);
    if (farmaco) return fichaCompleta(farmaco);

    // ── Sin coincidencias ──────────────────────────────────────────
    return `No encontré información sobre eso en la Farmacoteca HRDR. Puedes preguntarme por:

  · El nombre de un fármaco (ej: "¿cuál es la dosis de vancomicina?")
  · Una categoría (ej: "lista los antifúngicos")
  · Una alerta clínica (ej: "¿qué fármacos debo proteger de la luz?")
  · Estabilidad, velocidad o reconstitución de un fármaco específico`;
}
