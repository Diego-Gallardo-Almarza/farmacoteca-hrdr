// Tipos para la Farmacoteca HCSBA
// Base de datos farmacológica para internos de enfermería

export type CategoriaFarmaco =
  | "antibacteriano"
  | "antifungico"
  | "antiviral"
  | "aine_analgesico"
  | "opioide"
  | "digestivo"
  | "vitamina"
  | "mineral"
  | "corticoide"
  | "oncologico"
  | "psicofármaco";

export type TipoAlerta =
  | "nefrotoxicidad"
  | "ajuste_renal"
  | "riesgo_convulsion"
  | "lavar_via"
  | "transfusion"
  | "proteger_luz"
  | "homogenizar"
  | "refrigerar_viales"
  | "refrigerar"
  | "citostatico"
  | "alergia_penicilina"
  | "hipotension"
  | "pcr"
  | "anafilaxis"
  | "velocidad_administracion"
  | "qt_prolongado"
  | "verificar_solucion"
  | "no_aditivos"
  | "no_refrigerar"
  | "fotosensible"
  | "hepatotoxicidad"
  | "agranulocitosis"
  | "depresion_respiratoria"
  | "naloxona_cerca"
  | "extrapiramidal";

export interface Farmaco {
  id: string;
  nombre: string;
  presentacion: string[];
  categoria: CategoriaFarmaco;
  alertas: TipoAlerta[];
  cuidados: string;

  // Campos de dosificación (presentes en datos de antimicrobianos)
  dosis?: string;
  dosisDia?: string;
  dosisMaxima?: string;
  frecuencia?: string;
  reconstitucion?: string;
  concentracionDilucion?: string;
  solvente?: string;
  estabilidad?: string;
  velocidad?: string;

  // Nuevos campos farmacológicos del PDF HCSBA
  mecanismoAccion?: string;
  reaccionesAdversas?: string;
  interacciones?: string;
  dilucion?: string;
}

export interface MensajeChat {
  role: "user" | "assistant";
  content: string;
}
