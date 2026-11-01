export type Vacancy = {
  id: number;
  title: string;
  area: string;
  location: string;
  modality: string;
  openings: number;
  published: string;
  status: 'Publicada' | 'Pausada' | 'Cerrada';
  description: string;
  requirements: string[];
};
