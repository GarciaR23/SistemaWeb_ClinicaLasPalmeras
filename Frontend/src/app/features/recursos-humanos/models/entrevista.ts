export interface Appointment {
  id: number;
  applicationId: number;
  date: string;
  time: string;
  place?: string;
  site?: string;
}
export interface InterviewEvaluation {
  id: number;
  applicationId: number;
  result: string;
  score: number;
  notes: string;
}
