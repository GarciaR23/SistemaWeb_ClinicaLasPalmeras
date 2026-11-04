import { RegistroAuditoria } from './registro-auditoria';

function enDia(diasAtras: number, hora: number, minuto: number): number {
  const fecha = new Date();

  fecha.setDate(fecha.getDate() - diasAtras);
  fecha.setHours(hora, minuto, 0, 0);

  return fecha.getTime();
}

/** Historial base de la demostración; el backend reemplazará esta lista. */
export function crearAuditoriaDemostracion(): RegistroAuditoria[] {
  return [
    {
      id: -1,
      responsable: 'María González',
      accion: 'Preseleccionó a Carmen Flores',
      modulo: 'Postulaciones',
      marca: enDia(0, 9, 42),
      fechaTexto: '',
    },
    {
      id: -2,
      responsable: 'Dr. Luis Paredes',
      accion: 'Registró resultado de aptitud',
      modulo: 'Salud Ocupacional',
      marca: enDia(0, 8, 55),
      fechaTexto: '',
    },
    {
      id: -3,
      responsable: 'Alex Rojas',
      accion: 'Actualizó permisos de usuario',
      modulo: 'Seguridad',
      marca: enDia(1, 17, 20),
      fechaTexto: '',
    },
    {
      id: -4,
      responsable: 'María González',
      accion: 'Publicó la vacante Enfermera Jefe',
      modulo: 'Vacantes',
      marca: enDia(1, 15, 4),
      fechaTexto: '',
    },
  ];
}
