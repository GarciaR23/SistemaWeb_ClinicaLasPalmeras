import { Routes } from '@angular/router';
export const RUTAS: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/inicio-salud-ocupacional/inicio-salud-ocupacional').then(
        (m) => m.InicioSaludOcupacional,
      ),
  },
  {
    path: 'solicitudes',
    loadComponent: () =>
      import('./pages/solicitudes-recibidas/solicitudes-recibidas').then(
        (m) => m.SolicitudesRecibidas,
      ),
  },
  {
    path: 'agenda',
    loadComponent: () =>
      import('./pages/agenda-examenes/agenda-examenes').then(
        (m) => m.AgendaExamenes,
      ),
  },
  {
    path: 'resultados',
    loadComponent: () =>
      import('./pages/resultados-aptitud/resultados-aptitud').then(
        (m) => m.ResultadosAptitud,
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
