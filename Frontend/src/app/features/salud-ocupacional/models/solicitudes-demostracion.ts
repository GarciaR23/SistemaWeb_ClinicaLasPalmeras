import { SolicitudVista } from './solicitud-examen';

function hace(dias: number): string {
  const dia = new Date();

  dia.setDate(dia.getDate() - dias);

  return dia.toLocaleDateString('es-PE');
}

/**
 * Solicitudes de ejemplo para validar el diseño mientras RR. HH. no haya
 * enviado ninguna real. Siempre se muestran marcadas como «Demostración».
 */
export function solicitudesDemostracion(): SolicitudVista[] {
  return [
    {
      id: -1,
      nombre: 'Valeria Castro Núñez',
      puesto: 'Enfermera Jefe',
      dni: '70000001',
      fecha: hace(1),
      tipo: 'Examen pre ocupacional',
      estado: 'Pendiente',
      demostracion: true,
    },
    {
      id: -2,
      nombre: 'Marco Salazar Reyes',
      puesto: 'Técnico de Laboratorio',
      dni: '70000002',
      fecha: hace(2),
      tipo: 'Examen periódico',
      estado: 'Pendiente',
      demostracion: true,
    },
    {
      id: -3,
      nombre: 'Andrea Linares Soto',
      puesto: 'Médico Internista',
      dni: '70000003',
      fecha: hace(4),
      tipo: 'Examen pre ocupacional',
      estado: 'Programada',
      programacion: `${hace(-2)} · 09:30 · Sede San Isidro`,
      demostracion: true,
    },
    {
      id: -4,
      nombre: 'Diego Huerta Paz',
      puesto: 'Recepcionista',
      dni: '70000004',
      fecha: hace(9),
      tipo: 'Examen pre ocupacional',
      estado: 'Realizada',
      programacion: `${hace(3)} · 10:00 · Sede Miraflores`,
      demostracion: true,
    },
  ];
}
