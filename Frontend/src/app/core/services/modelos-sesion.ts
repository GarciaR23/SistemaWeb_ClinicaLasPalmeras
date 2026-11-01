export type UserRole = 'admin' | 'rrhh' | 'applicant' | 'health';
export interface Account {
  id: number;
  role: UserRole;
  name: string;
  email: string;
  active: boolean;
  lastAccess: string;
  phone?: string;
  location?: string;
  dni?: string;
  experience?: string;
}
export interface SessionUser {
    role: UserRole;
    name: string;
    email: string;
}
export const ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Administrador',
    rrhh: 'Recursos Humanos',
    applicant: 'Postulante',
    health: 'Salud Ocupacional'
};
export const ROLE_HOME: Record<UserRole, string> = {
  admin: '/administrador',
  rrhh: '/recursos-humanos',
  applicant: '/postulante',
  health: '/salud-ocupacional',
};
