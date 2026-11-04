export interface Fitness {
  id: number;
  applicationId: number;
  conclusion: string;
  /** Observación administrativa; nunca debe contener diagnósticos. */
  note?: string;
  registeredAt?: string;
}
