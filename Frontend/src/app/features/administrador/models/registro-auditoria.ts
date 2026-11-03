export interface RegistroAuditoria {
  id: number;
  responsable: string;
  accion: string;
  modulo: string;
  /** Marca de tiempo en milisegundos; null en registros antiguos sin fecha exacta. */
  marca: number | null;
  /** Texto de respaldo cuando no existe una marca de tiempo. */
  fechaTexto: string;
}
