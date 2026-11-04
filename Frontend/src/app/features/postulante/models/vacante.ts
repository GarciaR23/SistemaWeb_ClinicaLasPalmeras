export type Modalidad = 'Presencial' | 'Remoto' | 'Híbrido';

export interface Vacante {
  id: number;
  titulo: string;
  area: string;
  sede: string;
  fechaPublicacion: string; // ISO yyyy-MM-dd
  modalidad: Modalidad;
  descripcion: string;
  requisitos: string[];
}
