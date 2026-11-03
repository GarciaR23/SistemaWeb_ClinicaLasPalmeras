import { Routes } from '@angular/router';
export const RUTAS: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/inicio-administrador/inicio-administrador').then(
        (m) => m.InicioAdministrador,
      ),
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./pages/gestion-usuarios/gestion-usuarios').then(
        (m) => m.GestionUsuarios,
      ),
  },
  {
    path: 'cuenta',
    data: { mode: 'account' },
    loadComponent: () =>
      import('../recursos-humanos/pages/cuenta/cuenta').then((m) => m.AccountPage),
  },
  {
    path: 'configuracion',
    loadComponent: () =>
      import('../recursos-humanos/pages/configuracion/configuracion').then(
        (m) => m.Configuracion,
      ),
  },
];
