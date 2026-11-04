/** Conclusiones administrativas autorizadas; no se almacenan diagnósticos. */
export const CONCLUSIONES = [
  'Apto',
  'Apto con restricciones',
  'No apto',
] as const;

export type Conclusion = (typeof CONCLUSIONES)[number];

export interface FilaAptitud {
  applicationId: number;
  nombre: string;
  puesto: string;
  /** Fecha de la evaluación (AAAA-MM-DD). */
  fecha: string;
  sede: string;
  /** null mientras el resultado no se haya registrado. */
  conclusion: string | null;
  observacion?: string;
  /** La evaluación ya ocurrió (o la demostración lo permite). */
  puedeRegistrar: boolean;
}

export interface RegistroAptitud {
  applicationId: number;
  conclusion: Conclusion;
  note?: string;
}
