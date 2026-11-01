import { Routes } from '@angular/router';
import { LayoutPrincipal } from './layouts/main-layout/main-layout';
import { sessionGuard, roleGuard, guestGuard, homeGuard } from './core/guards/acceso-guard';
import { UserRole } from './core/services/modelos-sesion';
export const routes: Routes = [
  {
    path: 'iniciar-sesion',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./features/autenticacion/autenticacion.routes').then((m) => m.RUTAS),
  },
  {
    path: '',
    component: LayoutPrincipal,
    canActivate: [sessionGuard],
    children: [
      { path: '', pathMatch: 'full', canActivate: [homeGuard], children: [] },
      {
        path: 'administrador',
        canActivate: [roleGuard],
        data: { roles: ['admin'] satisfies UserRole[] },
        loadChildren: () =>
          import('./features/administrador/administrador.routes').then((m) => m.RUTAS),
      },
      {
        path: 'recursos-humanos',
        canActivate: [roleGuard],
        data: { roles: ['rrhh'] satisfies UserRole[] },
        loadChildren: () =>
          import('./features/recursos-humanos/recursos-humanos.routes').then((m) => m.RUTAS),
      },
      {
        path: 'postulante',
        canActivate: [roleGuard],
        data: { roles: ['applicant'] satisfies UserRole[] },
        loadChildren: () => import('./features/postulante/postulante.routes').then((m) => m.RUTAS),
      },
      {
        path: 'salud-ocupacional',
        canActivate: [roleGuard],
        data: { roles: ['health'] satisfies UserRole[] },
        loadChildren: () =>
          import('./features/salud-ocupacional/salud-ocupacional.routes').then((m) => m.RUTAS),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
