import { Status } from '../../recursos-humanos/models/postulante';

export const TIPOS_EXAMEN = [
  'Examen pre ocupacional',
  'Examen periódico',
  'Examen de retiro',
] as const;

/** Solicitud enviada por RR. HH.: solo datos administrativos, sin información clínica. */
export interface SolicitudExamen {
  /** Identificador de la postulación. */
  id: number;
  nombre: string;
  puesto: string;
  dni: string;
  fecha: string;
  estado: Status;
}

export interface ProgramacionExamen {
  applicationId: number;
  sede: string;
  fecha: string;
  hora: string;
  tipo: string;
}
