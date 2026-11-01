import { Routes } from '@angular/router';
export const RUTAS: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/inicio-recursos-humanos/inicio-recursos-humanos').then(
        (m) => m.InicioRecursosHumanos,
      ),
  },
  {
    path: 'postulantes',
    loadComponent: () =>
      import('./pages/lista-postulantes/lista-postulantes').then((m) => m.ApplicantsPage),
  },
  {
    path: 'postulantes/:id',
    loadComponent: () =>
      import('./pages/detalle-postulante/detalle-postulante').then((m) => m.CandidatePage),
  },
  {
    path: 'vacantes',
    loadComponent: () => import('./pages/vacantes/vacantes').then((m) => m.VacanciesPage),
  },
  {
    path: 'entrevistas',
    loadComponent: () => import('./pages/entrevistas/entrevistas').then((m) => m.InterviewsPage),
  },
  {
    path: 'examenes-medicos',
    loadComponent: () =>
      import('./pages/examenes-medicos/examenes-medicos').then((m) => m.ExamenesMedicos),
  },
  {
    path: 'resultados',
    loadComponent: () =>
      import('./pages/resultados/resultados').then(
        (m) => m.ResultsPage,
      ),
  },
  {
    path: 'resultados/:id',
    loadComponent: () =>
      import('./pages/detalle-resultado/detalle-resultado').then(
        (m) => m.DetalleResultado,
      ),
  },
  {
    path: 'cuenta',
    data: { mode: 'account' },
    loadComponent: () => import('./pages/cuenta/cuenta').then((m) => m.AccountPage),
  },
  {
    path: 'configuracion',
    loadComponent: () =>
      import('./pages/configuracion/configuracion').then(
        (m) => m.Configuracion,
      ),
  },
  { path: 'ayuda', loadComponent: () => import('./pages/ayuda/ayuda').then((m) => m.HelpPage) },


];


