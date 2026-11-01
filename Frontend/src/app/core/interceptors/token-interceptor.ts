import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = sessionStorage.getItem('palmeras_token');
  return next(
    token &&
      (request.url === environment.apiBase || request.url.startsWith(environment.apiBase + '/'))
      ? request.clone({ setHeaders: { Authorization: 'Bearer ' + token } })
      : request,
  );
};
