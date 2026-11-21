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

/** Estado de una solicitud de evaluación, tal como lo ve Salud Ocupacional. */
export type EstadoSolicitud = 'Pendiente' | 'Programada' | 'Realizada';

export const ESTADOS_SOLICITUD: EstadoSolicitud[] = [
  'Pendiente',
  'Programada',
  'Realizada',
];

/** Solicitud lista para mostrar: datos administrativos, sin información clínica. */
export interface SolicitudVista {
  /** Identificador de la postulación (negativo en los datos de demostración). */
  id: number;
  nombre: string;
  puesto: string;
  dni: string;
  /** Fecha en que RR. HH. envió la solicitud. */
  fecha: string;
  /** Tipo de evaluación solicitada. */
  tipo: string;
  estado: EstadoSolicitud;
  /** Fecha, hora y sede cuando ya está programada o realizada. */
  programacion?: string;
  /** Dato de ejemplo para validar el diseño: no corresponde a una persona real. */
  demostracion: boolean;
}
