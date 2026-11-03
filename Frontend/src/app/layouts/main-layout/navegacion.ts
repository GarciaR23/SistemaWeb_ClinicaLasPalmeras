import { UserRole } from '../../core/services/modelos-sesion';

export const ROLE_NAV: Record<
  UserRole,
  { page: string; label: string; icon: string }[]
> = {
  rrhh: [
    {
      page: 'recursos-humanos',
      label: 'Dashboard',
      icon: 'grid',
    },
    {
      page: 'recursos-humanos/postulantes',
      label: 'Postulantes',
      icon: 'user',
    },
    {
      page: 'recursos-humanos/vacantes',
      label: 'Vacantes',
      icon: 'briefcase',
    },
    {
      page: 'recursos-humanos/entrevistas',
      label: 'Entrevistas',
      icon: 'calendar',
    },
    {
      page: 'recursos-humanos/examenes-medicos',
      label: 'Exámenes médicos',
      icon: 'medical',
    },
    {
      page: 'recursos-humanos/resultados',
      label: 'Resultados',
      icon: 'chart',
    },
  ],

  admin: [
    {
      page: 'administrador',
      label: 'Dashboard',
      icon: 'grid',
    },
    {
      page: 'administrador/usuarios',
      label: 'Gestión de usuarios',
      icon: 'user',
    },
  ],

  applicant: [
    { page: 'postulante', label: 'Inicio', icon: 'grid' },
    { page: 'postulante/vacantes', label: 'Vacantes', icon: 'briefcase' },
    { page: 'postulante/mis-postulaciones', label: 'Mis postulaciones', icon: 'chart' },
    { page: 'postulante/mis-entrevistas', label: 'Mis entrevistas', icon: 'calendar' },
    { page: 'postulante/mis-evaluaciones', label: 'Mis evaluaciones', icon: 'medical' },
    { page: 'postulante/mis-documentos', label: 'Mis documentos', icon: 'file' },
  ],

  health: [
    {
      page: 'salud-ocupacional',
      label: 'Salud Ocupacional',
      icon: 'grid',
    },
  ],
};