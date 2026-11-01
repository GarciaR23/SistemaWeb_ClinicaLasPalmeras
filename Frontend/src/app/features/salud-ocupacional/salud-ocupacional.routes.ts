import { Routes } from '@angular/router';
export const RUTAS: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/inicio-salud-ocupacional/inicio-salud-ocupacional').then(
        (m) => m.InicioSaludOcupacional,
      ),
  },
];
