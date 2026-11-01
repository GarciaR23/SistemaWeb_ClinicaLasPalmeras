import { Injectable } from '@angular/core';

import { ResumenDashboard } from '../models/resumen-dashboard';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  obtenerResumen(): ResumenDashboard {
    return {
      indicadores: [
        {
          titulo: 'Postulantes activos',
          cantidad: 8,
          descripcion: '+12% este mes',
          icono: 'user',
          color: 'azul',
        },
        {
          titulo: 'Vacantes abiertas',
          cantidad: 8,
          descripcion: '3 prioritarias',
          icono: 'briefcase',
          color: 'amarillo',
        },
        {
          titulo: 'Entrevistas esta semana',
          cantidad: 12,
          descripcion: '4 para hoy',
          icono: 'calendar',
          color: 'morado',
        },
        {
          titulo: 'Contrataciones',
          cantidad: 5,
          descripcion: 'Meta mensual: 8',
          icono: 'check',
          color: 'verde',
        },
      ],

      etapas: [
        { nombre: 'En revisión', cantidad: 21 },
        { nombre: 'Preseleccionado', cantidad: 11 },
        { nombre: 'Entrevista', cantidad: 8 },
        { nombre: 'Examen médico', cantidad: 5 },
        { nombre: 'Evaluado', cantidad: 3 },
      ],

      entrevistas: [
        {
          id: 1,
          hora: '09:00',
          nombre: 'Carmen Flores',
          puesto: 'Enfermera Jefe',
          iniciales: 'CF',
        },
        {
          id: 2,
          hora: '11:30',
          nombre: 'Jorge Quispe',
          puesto: 'Técnico de Lab.',
          iniciales: 'JQ',
        },
        {
          id: 3,
          hora: '15:00',
          nombre: 'Andrés Martínez',
          puesto: 'Médico Internista',
          iniciales: 'AM',
        },
      ],

      actividades: [
        {
          id: 1,
          descripcion: 'Carmen Flores fue preseleccionada',
          tiempo: 'Hace 20 minutos',
          icono: 'check',
        },
        {
          id: 2,
          descripcion: 'Entrevista programada con Jorge Quispe',
          tiempo: 'Hace 1 hora',
          icono: 'calendar',
        },
        {
          id: 3,
          descripcion: 'Nuevo CV recibido para Pediatra',
          tiempo: 'Hace 3 horas',
          icono: 'file',
        },
      ],
    };
  }
}