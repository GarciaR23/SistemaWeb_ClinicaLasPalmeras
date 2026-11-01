import { Routes } from '@angular/router';
export const RUTAS: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/inicio-administrador/inicio-administrador').then(
        (m) => m.InicioAdministrador,
      ),
  },
];
