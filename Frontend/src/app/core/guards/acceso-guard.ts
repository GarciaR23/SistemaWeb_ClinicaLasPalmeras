import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Session, UserRole } from '../services/sesion';
export const sessionGuard: CanActivateFn = () =>
  inject(Session).user() ? true : inject(Router).createUrlTree(['/iniciar-sesion']);
export const guestGuard: CanActivateFn = () => {
  const s = inject(Session);
  return s.user() ? inject(Router).parseUrl(s.home()) : true;
};
export const roleGuard: CanActivateFn = (route) => {
  const s = inject(Session);
  if (!s.user()) return inject(Router).createUrlTree(['/iniciar-sesion']);
  const roles = route.data['roles'] as UserRole[] | undefined;
  return !roles || roles.includes(s.role()!) ? true : inject(Router).parseUrl(s.home());
};
export const homeGuard: CanActivateFn = () => inject(Router).parseUrl(inject(Session).home());
