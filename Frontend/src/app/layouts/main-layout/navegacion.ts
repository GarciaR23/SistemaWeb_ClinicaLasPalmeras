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
      label: 'Administrador',
      icon: 'grid',
    },
  ],

  applicant: [
    {
      page: 'postulante',
      label: 'Postulante',
      icon: 'grid',
    },
  ],

  health: [
    {
      page: 'salud-ocupacional',
      label: 'Salud Ocupacional',
      icon: 'grid',
    },
  ],
};