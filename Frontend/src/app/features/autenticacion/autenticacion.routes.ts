import { Routes } from '@angular/router';
export const RUTAS: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/iniciar-sesion/iniciar-sesion').then((m) => m.IniciarSesion),
    },
];