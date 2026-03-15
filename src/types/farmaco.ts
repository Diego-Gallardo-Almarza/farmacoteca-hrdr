// Tipos para la Farmacoteca HRDR
// Uso exclusivo pediátrico — pacientes < 15 años

export type CategoriaFarmaco = "antibacteriano" | "antifungico" | "antiviral";

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
  | "no_refrigerar";

export interface Farmaco {
  id: string;
  nombre: string;
  presentacion: string[];
  dosis: string;
  dosisDia: string;
  dosisMaxima: string;
  frecuencia: string;
  reconstitucion: string;
  concentracionDilucion: string;
  solvente: string;
  estabilidad: string;
  velocidad: string;
  cuidados: string;
  categoria: CategoriaFarmaco;
  alertas: TipoAlerta[];
}

export interface MensajeChat {
  role: "user" | "assistant";
  content: string;
}
