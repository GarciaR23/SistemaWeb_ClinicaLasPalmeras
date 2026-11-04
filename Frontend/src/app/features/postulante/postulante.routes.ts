import { Routes } from '@angular/router';

export const RUTAS: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/inicio-postulante/inicio-postulante').then((m) => m.InicioPostulante),
  },
  {
    path: 'vacantes',
    loadComponent: () => import('./pages/vacantes/vacantes').then((m) => m.Vacantes),
  },
  {
    path: 'vacantes/:id',
    loadComponent: () =>
      import('./pages/detalle-vacante/detalle-vacante').then((m) => m.DetalleVacante),
  },
  {
    path: 'mis-postulaciones',
    loadComponent: () =>
      import('./pages/mis-postulaciones/mis-postulaciones').then((m) => m.MisPostulaciones),
  },
  {
    path: 'mis-entrevistas',
    loadComponent: () =>
      import('./pages/mis-entrevistas/mis-entrevistas').then((m) => m.MisEntrevistas),
  },
  {
    path: 'mis-evaluaciones',
    loadComponent: () =>
      import('./pages/mis-evaluaciones/mis-evaluaciones').then((m) => m.MisEvaluaciones),
  },
  {
    path: 'mis-documentos',
    loadComponent: () =>
      import('./pages/mis-documentos/mis-documentos').then((m) => m.MisDocumentos),
  },
  {
    path: 'notificaciones',
    loadComponent: () =>
      import('./pages/notificaciones/notificaciones').then((m) => m.Notificaciones),
  },
];