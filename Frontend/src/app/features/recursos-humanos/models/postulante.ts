export type Status =
  | 'En revisión'
  | 'Preseleccionado'
  | 'Entrevista'
  | 'Solicitud médica'
  | 'Examen médico'
  | 'Evaluado'
  | 'Contratado'
  | 'Rechazado';

export interface CandidateDocument {
  name: string;
  url: string;
  sizeBytes?: number;
}

export type Candidate = {
  id: number;
  vacancyId?: number;
  name: string;
  role: string;
  date: string;
  status: Status;
  email: string;
  phone: string;
  dni: string;
  experience: string;
  location: string;

  availability?: string;
  workMode?: string;
  cv?: CandidateDocument;

  rejectionReason?: string;
  statusBeforeRejection?: Exclude<Status, 'Rechazado'>;
};