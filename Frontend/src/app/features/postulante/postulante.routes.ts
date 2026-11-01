import { Routes } from '@angular/router';
export const RUTAS: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/inicio-postulante/inicio-postulante').then((m) => m.InicioPostulante),
  },
];
