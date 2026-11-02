export interface Evaluacion {
  id: number;
  tipo: string;
  fecha: string; // ISO yyyy-MM-dd
  hora: string;
  sede: string;
  indicaciones: string; // solo indicaciones administrativas autorizadas
}
