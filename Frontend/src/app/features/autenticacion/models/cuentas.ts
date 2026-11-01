import { Account } from '../../../core/services/modelos-sesion';
export const CUENTAS_DEMOSTRACION: (Account & { password: string })[] = [
  {
    id: 1,
    role: 'admin',
    name: 'Alex Rojas',
    email: 'admin@clinicapalmeras.com',
    password: 'demo123',
    active: true,
    lastAccess: '—',
  },
  {
    id: 2,
    role: 'rrhh',
    name: 'María González',
    email: 'rrhh@clinicapalmeras.com',
    password: 'demo123',
    active: true,
    lastAccess: '—',
  },
  {
    id: 3,
    role: 'applicant',
    name: 'Lucía Torres',
    email: 'postulante@clinicapalmeras.com',
    password: 'demo123',
    active: true,
    lastAccess: '—',
  },
  {
    id: 4,
    role: 'health',
    name: 'Dr. Luis Paredes',
    email: 'salud@clinicapalmeras.com',
    password: 'demo123',
    active: true,
    lastAccess: '—',
  },
];
