import { Vacante } from './vacante';

export const VACANTES_DEMOSTRACION: Vacante[] = [
  {
    id: 1, titulo: 'Enfermera Jefe', area: 'Enfermería', sede: 'Miraflores',
    fechaPublicacion: '2026-08-18', modalidad: 'Presencial',
    descripcion: 'Liderar el equipo de enfermería y asegurar una atención segura y humana.',
    requisitos: ['Licenciatura en Enfermería', 'Colegiatura vigente', '3 años de experiencia hospitalaria'],
  },
  {
    id: 2, titulo: 'Médico Internista', area: 'Medicina', sede: 'San Isidro',
    fechaPublicacion: '2026-08-17', modalidad: 'Presencial',
    descripcion: 'Atención integral de pacientes adultos en consulta y hospitalización.',
    requisitos: ['Título de Médico Cirujano', 'Especialidad en Medicina Interna', 'Registro RNE vigente'],
  },
  {
    id: 3, titulo: 'Técnico de Laboratorio', area: 'Laboratorio', sede: 'La Molina',
    fechaPublicacion: '2026-08-15', modalidad: 'Presencial',
    descripcion: 'Procesamiento de muestras y apoyo en procedimientos de laboratorio clínico.',
    requisitos: ['Título técnico en Laboratorio Clínico', '1 año de experiencia', 'Manejo de bioseguridad'],
  },
];
