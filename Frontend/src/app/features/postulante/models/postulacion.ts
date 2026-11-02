export const ETAPAS_POSTULACION = [
  'Recibida',
  'En revisión',
  'Preseleccionada',
  'Entrevista',
  'Evaluación médica',
  'Revisión final',
  'Resultado',
] as const;

export interface Postulacion {
  id: number;
  vacanteId: number;
  puesto: string;
  area: string;
  fechaEnvio: string; // ISO yyyy-MM-dd
  etapaActual: number; // índice en ETAPAS_POSTULACION
}
