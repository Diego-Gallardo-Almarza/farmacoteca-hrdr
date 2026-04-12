/**
 * asistente.ts — Motor de asistente local para la Farmacoteca HRDR
 *
 * Interpreta preguntas en lenguaje natural en español y responde
 * ÚNICAMENTE con datos del archivo farmacos.json (base de adultos).
 *
 * Sin dependencias externas. Sin API. Sin internet.
 */

import { Farmaco, TipoAlerta, CategoriaFarmaco } from "@/types/farmaco";

// ══════════════════════════════════════════════════════════════════
// NORMALIZACIÓN
// ══════════════════════════════════════════════════════════════════

function normalizar(texto: string): string {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[¿?¡!.,;:()"']/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// ══════════════════════════════════════════════════════════════════
// ABREVIACIONES
// ══════════════════════════════════════════════════════════════════

const ABREVIACIONES: Record<string, string> = {
    // AINEs / analgésicos
    "keto": "ketorolaco",
    "ketorolac": "ketorolaco",
    "para": "paracetamol",
    "acetaminofen": "paracetamol",
    "dipirona": "metamizol",
    "ketopro": "ketoprofeno",
    "ibupro": "ibuprofeno",
    "diclo": "diclofenaco",
    // Opioides
    "fenta": "fentanilo",
    "fentanil": "fentanilo",
    "mor": "morfina",
    "trama": "tramadol",
    "bupre": "buprenorfina",
    "metad": "metadona",
    // Antibacterianos
    "vanco": "vancomicina",
    "metro": "metronidazol",
    "pip-tazo": "piperacilina",
    "pip tazo": "piperacilina",
    "tazobactam": "piperacilina",
    "cipro": "ciprofloxacino",
    "mero": "meropenem",
    "amp-sul": "ampicilina sulbactam",
    "ceftri": "ceftriaxona",
    "cefta": "ceftazidima",
    "cefaz": "cefazolina",
    "clinda": "clindamicina",
    "clox": "cloxacilina",
    "cotri": "cotrimoxazol",
    "levo": "levofloxacino",
    "amika": "amikacina",
    "genta": "gentamicina",
    "ampicil": "ampicilina",
    "ertapen": "ertapenem",
    // Antifúngicos
    "fluco": "fluconazol",
    "vori": "voriconazol",
    "caspo": "caspofungina",
    "anidula": "anidulafungina",
    "ambi": "anfotericina",
    // Sedantes / otros
    "midazo": "midazolam",
    "propo": "propofol",
    "dexme": "dexmedetomidina",
    "dexa": "dexametasona",
    "hidrocor": "hidrocortisona",
    "omepra": "omeprazol",
    "ondanse": "ondansetron",
    "halope": "haloperidol",
};

function expandirAbreviaciones(texto: string): string {
    let resultado = texto;
    for (const [abrev, completo] of Object.entries(ABREVIACIONES)) {
        if (resultado.includes(abrev)) {
            resultado = resultado.replace(new RegExp(`\\b${abrev}\\b`, "g"), completo);
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
    | "BUSCAR_MECANISMO"
    | "BUSCAR_INTERACCIONES"
    | "BUSCAR_REACCIONES_ADVERSAS"
    | "BUSCAR_DILUCION"
    | "BUSCAR_ESTABILIDAD"
    | "BUSCAR_VELOCIDAD"
    | "BUSCAR_RECONSTITUCION"
    | "LISTAR_TODO"
    | "COMPARAR"
    | "FUERA_DE_ALCANCE"
    | "DESCONOCIDO";

const PALABRAS_FUERA_ALCANCE = [
    "clima", "noticias", "politica", "deporte", "futbol", "tenis",
    "matematicas", "historia", "geografia", "receta", "cocina",
    "pelicula", "musica", "amor", "chiste", "quien eres",
    "como estas", "broma", "juego",
];

const PALABRAS_ALERTA: Record<string, TipoAlerta | TipoAlerta[]> = {
    "proteger luz": "proteger_luz",
    "protegida luz": "proteger_luz",
    "fotosensible": "fotosensible",
    "luz": "proteger_luz",
    "refrigerar": ["refrigerar", "refrigerar_viales"],
    "nevera": ["refrigerar", "refrigerar_viales"],
    "convulsion": "riesgo_convulsion",
    "convulsiones": "riesgo_convulsion",
    "anafilaxis": "anafilaxis",
    "anafilaxia": "anafilaxis",
    "anafilactico": "anafilaxis",
    "nefrotoxicidad": "nefrotoxicidad",
    "nefrotoxica": "nefrotoxicidad",
    "hipotension": "hipotension",
    "hipotensivo": "hipotension",
    "citostatico": "citostatico",
    "citotoxico": "citostatico",
    "pcr": "pcr",
    "paro cardiorrespiratorio": "pcr",
    "aditivos": "no_aditivos",
    "homogenizar": "homogenizar",
    "lavar via": "lavar_via",
    "qt": "qt_prolongado",
    "qt prolongado": "qt_prolongado",
    "transfusion": "transfusion",
    "ajuste renal": "ajuste_renal",
    "velocidad administracion": "velocidad_administracion",
    "hepatotoxicidad": "hepatotoxicidad",
    "agranulocitosis": "agranulocitosis",
    "depresion respiratoria": "depresion_respiratoria",
    "naloxona": "naloxona_cerca",
    "extrapiramidal": "extrapiramidal",
};

function detectarIntencion(texto: string): Intencion {
    if (PALABRAS_FUERA_ALCANCE.some((p) => texto.includes(p))) {
        return "FUERA_DE_ALCANCE";
    }
    if (/listar|lista\b|todos los|cuales son|mostrar todos|dame todos|enumera/.test(texto)) {
        return "LISTAR_TODO";
    }
    if (/diferencia|compara|comparar|versus|\bvs\b/.test(texto)) {
        return "COMPARAR";
    }
    if (/mecanismo|como actua|como funciona|accion farmacologica|farmacodinamia|receptor/.test(texto)) {
        return "BUSCAR_MECANISMO";
    }
    if (/interaccion|interacciones|combinacion con|junto con|contraindicado con|potencia|antagoniz/.test(texto)) {
        return "BUSCAR_INTERACCIONES";
    }
    if (/reaccion adversa|efectos adversos|efectos secundarios|efectos indeseados|toxicidad|ra\b|ram\b/.test(texto)) {
        return "BUSCAR_REACCIONES_ADVERSAS";
    }
    if (/dilucion|diluir|como diluir|como preparar|concentracion|ml en/.test(texto)) {
        return "BUSCAR_DILUCION";
    }
    if (/reconstituir|reconstitucion|disolver|preparar el/.test(texto)) {
        return "BUSCAR_RECONSTITUCION";
    }
    if (/velocidad|tiempo de infusion|cuanto tiempo infundir|pasar en|infundir en/.test(texto)) {
        return "BUSCAR_VELOCIDAD";
    }
    if (/\bestable\b|estabilidad|cuanto dura|cuanto tiempo dura|vence|refrigerado/.test(texto)) {
        return "BUSCAR_ESTABILIDAD";
    }
    // Alertas
    for (const palabraAlerta of Object.keys(PALABRAS_ALERTA)) {
        if (texto.includes(palabraAlerta)) return "BUSCAR_POR_ALERTA";
    }
    // Categoría
    if (/antibacteriano|antibiotico|bacteria|anti-bacteria/.test(texto)) return "BUSCAR_POR_CATEGORIA";
    if (/antifungico|hongo|fungic|candida/.test(texto)) return "BUSCAR_POR_CATEGORIA";
    if (/antiviral|virus|viral/.test(texto)) return "BUSCAR_POR_CATEGORIA";
    if (/opioide|narcotico|opio/.test(texto)) return "BUSCAR_POR_CATEGORIA";
    if (/aine|analgesico|antiinflamatorio/.test(texto)) return "BUSCAR_POR_CATEGORIA";
    if (/corticoide|esteroide|corticosteroide/.test(texto)) return "BUSCAR_POR_CATEGORIA";
    if (/digestivo|antiemetico|antiacido|gastrointestinal/.test(texto)) return "BUSCAR_POR_CATEGORIA";
    if (/psicofarmaco|psiquiatrico|antipsicotic|ansiolitic|benzodiacepina/.test(texto)) return "BUSCAR_POR_CATEGORIA";
    if (/oncologico|quimio|citostatico|antineoplasico/.test(texto)) return "BUSCAR_POR_CATEGORIA";
    if (/vitamina|mineral|electrolito/.test(texto)) return "BUSCAR_POR_CATEGORIA";

    if (/dosis|cuanto|cual es|informacion|dime|necesito saber|cuentame|administrar|presentacion|cuidado|alerta|ampolla|frasco|precaucion/.test(texto)) {
        return "BUSCAR_FARMACO";
    }

    return "DESCONOCIDO";
}

// ══════════════════════════════════════════════════════════════════
// EXTRACCIÓN DEL FÁRMACO MENCIONADO
// ══════════════════════════════════════════════════════════════════

function extraerFarmaco(texto: string, farmacos: Farmaco[]): Farmaco | null {
    const textoExpandido = expandirAbreviaciones(texto);

    // 1. Nombre normalizado exacto
    for (const f of farmacos) {
        if (textoExpandido.includes(normalizar(f.nombre))) return f;
    }
    // 2. Por id
    for (const f of farmacos) {
        if (textoExpandido.includes(normalizar(f.id))) return f;
    }
    // 3. Coincidencia parcial por palabras >= 4 letras
    const palabras = textoExpandido.split(/\s+/).filter((p) => p.length >= 4);
    let mejorCoincidencia: Farmaco | null = null;
    let mejorScore = 0;

    for (const farmaco of farmacos) {
        const nombreNorm = normalizar(farmaco.nombre);
        let score = 0;
        for (const palabra of palabras) {
            if (nombreNorm.includes(palabra)) score += palabra.length;
        }
        if (score > mejorScore) { mejorScore = score; mejorCoincidencia = farmaco; }
    }

    return mejorScore >= 4 ? mejorCoincidencia : null;
}

function detectarAlertaBuscada(texto: string): TipoAlerta[] {
    const alertas: TipoAlerta[] = [];
    for (const [clave, tipoAlerta] of Object.entries(PALABRAS_ALERTA)) {
        if (texto.includes(clave)) {
            const arr = Array.isArray(tipoAlerta) ? tipoAlerta : [tipoAlerta];
            for (const a of arr) { if (!alertas.includes(a)) alertas.push(a); }
        }
    }
    return alertas;
}

// ══════════════════════════════════════════════════════════════════
// DETECCIÓN DE CATEGORÍA
// ══════════════════════════════════════════════════════════════════

function detectarCategoria(texto: string): CategoriaFarmaco | null {
    if (/antibacteriano|antibiotico|bacteria/.test(texto)) return "antibacteriano";
    if (/antifungico|hongo|fungic|candida/.test(texto)) return "antifungico";
    if (/antiviral|virus|viral/.test(texto)) return "antiviral";
    if (/opioide|narcotico|opio/.test(texto)) return "opioide";
    if (/aine|analgesico|antiinflamatorio/.test(texto)) return "aine_analgesico";
    if (/corticoide|esteroide|corticosteroide/.test(texto)) return "corticoide";
    if (/digestivo|antiemetico|antiacido|gastrointestinal/.test(texto)) return "digestivo";
    if (/psicofarmaco|psiquiatrico|antipsicotic|ansiolitic|benzodiacepina/.test(texto)) return "psicofármaco";
    if (/oncologico|quimio|citostatico/.test(texto)) return "oncologico";
    if (/vitamina/.test(texto)) return "vitamina";
    if (/mineral|electrolito/.test(texto)) return "mineral";
    return null;
}

// ══════════════════════════════════════════════════════════════════
// ETIQUETAS DE CATEGORÍAS
// ══════════════════════════════════════════════════════════════════

const ETIQUETAS_CATEGORIA: Record<CategoriaFarmaco, string> = {
    antibacteriano: "Antibacterianos",
    antifungico: "Antifúngicos",
    antiviral: "Antivirales",
    aine_analgesico: "AINEs / Analgésicos",
    opioide: "Opioides",
    digestivo: "Digestivo / Antiemético",
    vitamina: "Vitaminas",
    mineral: "Minerales / Electrolitos",
    corticoide: "Corticoides",
    oncologico: "Oncológicos",
    "psicofármaco": "Psicofármacos",
};

// ══════════════════════════════════════════════════════════════════
// GENERADORES DE RESPUESTA
// ══════════════════════════════════════════════════════════════════

/** Campo opcional formateado — devuelve la línea o cadena vacía */
function campo(emoji: string, etiqueta: string, valor: string | undefined): string {
    if (!valor || valor === "---") return "";
    return `${emoji} **${etiqueta}:** ${valor}`;
}

function fichaCompleta(f: Farmaco): string {
    const presentaciones = f.presentacion.join("\n   · ");
    const alertasTexto = f.alertas.length > 0 ? f.alertas.join(", ") : "Ninguna registrada";

    const lineas = [
        `📋 **${f.nombre}**`,
        "",
        `💊 **Presentación:**\n   · ${presentaciones}`,
    ];

    const opcionales = [
        campo("📏", "Dosis", f.dosis),
        campo("💉", "Dilución", f.dilucion),
        campo("🔁", "Frecuencia", f.frecuencia),
        campo("⏱️", "Estabilidad", f.estabilidad),
        campo("🧪", "Reconstitución", f.reconstitucion),
        campo("🧴", "Solvente", f.solvente),
        campo("💧", "Conc. en dilución", f.concentracionDilucion),
        campo("🚀", "Velocidad de infusión", f.velocidad),
        campo("🔬", "Mecanismo de acción", f.mecanismoAccion),
        campo("⚠️", "Reacciones adversas", f.reaccionesAdversas),
        campo("🔗", "Interacciones", f.interacciones),
        campo("🚨", "Cuidados especiales", f.cuidados !== "---" ? f.cuidados : undefined),
    ].filter(Boolean);

    lineas.push(...opcionales);
    lineas.push(`🏷️ **Alertas:** ${alertasTexto}`);

    return lineas.join("\n");
}

function fichaCorta(f: Farmaco): string {
    const lineas = [`📋 **${f.nombre}**`];
    if (f.dosis) lineas.push(`📏 **Dosis:** ${f.dosis}`);
    if (f.dilucion) lineas.push(`💉 **Dilución:** ${f.dilucion}`);
    if (f.cuidados && f.cuidados !== "---") lineas.push(`🚨 **Cuidados:** ${f.cuidados}`);
    return lineas.join("\n");
}

function respuestaMecanismo(f: Farmaco): string {
    if (!f.mecanismoAccion) {
        return `No hay información de mecanismo de acción registrada para **${f.nombre}** en la Farmacoteca HRDR.`;
    }
    return `🔬 **${f.nombre} — Mecanismo de acción**\n\n${f.mecanismoAccion}`;
}

function respuestaInteracciones(f: Farmaco): string {
    if (!f.interacciones || f.interacciones === "---") {
        return `No hay interacciones registradas para **${f.nombre}** en la Farmacoteca HRDR.`;
    }
    return `🔗 **${f.nombre} — Interacciones**\n\n${f.interacciones}`;
}

function respuestaReaccionesAdversas(f: Farmaco): string {
    if (!f.reaccionesAdversas || f.reaccionesAdversas === "---") {
        return `No hay reacciones adversas registradas para **${f.nombre}** en la Farmacoteca HRDR.`;
    }
    return `⚠️ **${f.nombre} — Reacciones adversas**\n\n${f.reaccionesAdversas}`;
}

function respuestaDilucion(f: Farmaco): string {
    const partes = [
        campo("💉", "Dilución", f.dilucion),
        campo("🧴", "Solvente", f.solvente),
        campo("💧", "Conc. en dilución", f.concentracionDilucion),
        campo("🧪", "Reconstitución", f.reconstitucion),
    ].filter(Boolean);

    if (partes.length === 0) {
        return `No hay información de dilución registrada para **${f.nombre}** en la Farmacoteca HRDR.`;
    }
    return `💉 **${f.nombre} — Preparación / Dilución**\n\n${partes.join("\n")}`;
}

function respuestaEstabilidad(f: Farmaco): string {
    if (!f.estabilidad) return `No hay datos de estabilidad registrados para **${f.nombre}**.`;
    return `⏱️ **${f.nombre}**\n\n📌 **Estabilidad:** ${f.estabilidad}`;
}

function respuestaVelocidad(f: Farmaco): string {
    if (!f.velocidad) return `No hay datos de velocidad de infusión registrados para **${f.nombre}**.`;
    return `💉 **${f.nombre}**\n\n📌 **Velocidad de infusión:** ${f.velocidad}`;
}

function listarPorCategoria(farmacos: Farmaco[], cat: CategoriaFarmaco): string {
    const lista = farmacos.filter((f) => f.categoria === cat);
    if (lista.length === 0) {
        return `No hay fármacos de la categoría "${ETIQUETAS_CATEGORIA[cat]}" en la Farmacoteca HRDR.`;
    }
    const encabezado = `🔬 **${ETIQUETAS_CATEGORIA[cat]}** (${lista.length} fármacos)\n`;
    const items = lista
        .map((f) => {
            const info = f.dosis ?? f.dilucion ?? "";
            return `  · **${f.nombre}**${info ? ` — ${info}` : ""}`;
        })
        .join("\n");
    return encabezado + items;
}

function listarTodo(farmacos: Farmaco[]): string {
    // Agrupar por categoría, omitir categorías vacías
    const todas = Object.keys(ETIQUETAS_CATEGORIA) as CategoriaFarmaco[];
    const secciones = todas
        .map((cat) => {
            const lista = farmacos.filter((f) => f.categoria === cat);
            if (lista.length === 0) return "";
            const items = lista.map((f) => `  · ${f.nombre}`).join("\n");
            return `🔬 **${ETIQUETAS_CATEGORIA[cat]}** (${lista.length}):\n${items}`;
        })
        .filter(Boolean);

    return `📚 **Farmacoteca HRDR — Lista completa** (${farmacos.length} fármacos)\n\n` + secciones.join("\n\n");
}

function buscarPorAlerta(farmacos: Farmaco[], alertas: TipoAlerta[]): string {
    const coincidentes = farmacos.filter((f) =>
        alertas.some((a) => f.alertas.includes(a))
    );
    if (coincidentes.length === 0) {
        return `No encontré fármacos con esa alerta en la Farmacoteca HRDR.`;
    }
    const titulo = `⚠️ **Fármacos con esa alerta** (${coincidentes.length} encontrados):`;
    const items = coincidentes
        .map((f) => {
            const cuidado = f.cuidados && f.cuidados !== "---" ? f.cuidados : f.alertas.join(", ");
            return `  · **${f.nombre}**\n    🚨 ${cuidado}`;
        })
        .join("\n\n");
    return titulo + "\n\n" + items + "\n\n_💡 Verifica siempre el protocolo institucional._";
}

function respuestaComparacion(f1: Farmaco, f2: Farmaco): string {
    const fila = (campo: string, v1: string | undefined, v2: string | undefined) =>
        `  · **${campo}:** ${v1 ?? "—"} / ${v2 ?? "—"}`;

    return [
        `🔍 **${f1.nombre}  vs  ${f2.nombre}**`,
        "",
        fila("Dosis", f1.dosis, f2.dosis),
        fila("Dilución", f1.dilucion, f2.dilucion),
        fila("Categoría", f1.categoria.replace("_", " "), f2.categoria.replace("_", " ")),
        fila("Alertas", f1.alertas.join(", ") || "—", f2.alertas.join(", ") || "—"),
    ].join("\n");
}

// ══════════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL — EXPORTADA
// ══════════════════════════════════════════════════════════════════

export function procesarConsulta(pregunta: string, farmacos: Farmaco[]): string {
    if (!pregunta?.trim()) {
        return "Por favor escribe tu consulta sobre los fármacos de la Farmacoteca HRDR.";
    }

    const texto = normalizar(pregunta);
    const intencion = detectarIntencion(texto);

    // ── Fuera de alcance ───────────────────────────────────────────
    if (intencion === "FUERA_DE_ALCANCE") {
        return "Solo puedo responder consultas sobre los fármacos de la **Farmacoteca HRDR**. Pregúntame por un fármaco, una categoría (opioides, AINEs, antibacterianos…) o una alerta clínica.";
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
        return buscarPorAlerta(farmacos, alertas);
    }

    // ── Mecanismo de acción ────────────────────────────────────────
    if (intencion === "BUSCAR_MECANISMO") {
        const farmaco = extraerFarmaco(texto, farmacos);
        if (farmaco) return respuestaMecanismo(farmaco);
        return "Indica el nombre del fármaco del que necesitas conocer el mecanismo de acción.";
    }

    // ── Interacciones ──────────────────────────────────────────────
    if (intencion === "BUSCAR_INTERACCIONES") {
        const farmaco = extraerFarmaco(texto, farmacos);
        if (farmaco) return respuestaInteracciones(farmaco);
        return "Indica el nombre del fármaco del que necesitas conocer las interacciones.";
    }

    // ── Reacciones adversas ────────────────────────────────────────
    if (intencion === "BUSCAR_REACCIONES_ADVERSAS") {
        const farmaco = extraerFarmaco(texto, farmacos);
        if (farmaco) return respuestaReaccionesAdversas(farmaco);
        return "Indica el nombre del fármaco del que necesitas conocer las reacciones adversas.";
    }

    // ── Dilución / preparación ─────────────────────────────────────
    if (intencion === "BUSCAR_DILUCION" || intencion === "BUSCAR_RECONSTITUCION") {
        const farmaco = extraerFarmaco(texto, farmacos);
        if (farmaco) return respuestaDilucion(farmaco);
        return "Indica el nombre del fármaco del que necesitas conocer la dilución o preparación.";
    }

    // ── Estabilidad ────────────────────────────────────────────────
    if (intencion === "BUSCAR_ESTABILIDAD") {
        const farmaco = extraerFarmaco(texto, farmacos);
        if (farmaco) return respuestaEstabilidad(farmaco);
        const items = farmacos
            .filter((f) => f.estabilidad)
            .map((f) => `  · **${f.nombre}**: ${f.estabilidad}`)
            .join("\n");
        return items
            ? `⏱️ **Estabilidad de fármacos con ese dato:**\n\n${items}`
            : "No hay datos de estabilidad registrados en la Farmacoteca HRDR.";
    }

    // ── Velocidad de infusión ──────────────────────────────────────
    if (intencion === "BUSCAR_VELOCIDAD") {
        const farmaco = extraerFarmaco(texto, farmacos);
        if (farmaco) return respuestaVelocidad(farmaco);
        const items = farmacos
            .filter((f) => f.velocidad)
            .map((f) => `  · **${f.nombre}**: ${f.velocidad}`)
            .join("\n");
        return items
            ? `💉 **Velocidad de infusión de todos los fármacos:**\n\n${items}`
            : "No hay datos de velocidad de infusión registrados.";
    }

    // ── Comparación ────────────────────────────────────────────────
    if (intencion === "COMPARAR") {
        const textoExpandido = expandirAbreviaciones(texto);
        const farmacosMencionados: Farmaco[] = [];
        for (const f of farmacos) {
            if (textoExpandido.includes(normalizar(f.nombre)) || textoExpandido.includes(normalizar(f.id))) {
                if (farmacosMencionados.length < 2) farmacosMencionados.push(f);
            }
        }
        if (farmacosMencionados.length >= 2) {
            return respuestaComparacion(farmacosMencionados[0], farmacosMencionados[1]);
        }
        if (farmacosMencionados.length === 1) {
            return fichaCorta(farmacosMencionados[0]) + "\n\n_Para comparar, menciona los dos fármacos en tu consulta._";
        }
        return "Para comparar, menciona los dos fármacos. Ejemplo: 'compara morfina vs fentanilo'";
    }

    // ── Búsqueda general por nombre ────────────────────────────────
    const farmaco = extraerFarmaco(texto, farmacos);
    if (farmaco) return fichaCompleta(farmaco);

    // ── Sin coincidencias ──────────────────────────────────────────
    return `No encontré información sobre eso en la Farmacoteca HRDR. Puedes preguntarme por:

  · Un fármaco específico (ej: "¿cuál es la dosis del ketorolaco?")
  · Una categoría (ej: "lista los opioides")
  · Mecanismo de acción (ej: "¿cómo actúa el fentanilo?")
  · Interacciones (ej: "interacciones de la morfina")
  · Reacciones adversas (ej: "efectos adversos del metamizol")
  · Una alerta clínica (ej: "¿qué fármacos producen depresión respiratoria?")`;
}
