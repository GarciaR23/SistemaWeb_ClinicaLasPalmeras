import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private http = inject(HttpClient);
  async request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.request<T>(method, environment.apiBase + path, { body }),
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse)
        throw Error(
          error.error?.error ||
            error.error?.message ||
            (error.status === 0
              ? 'No se pudo conectar con el servicio.'
              : 'No se pudo completar la solicitud (HTTP ' + error.status + ').'),
        );
      throw error;
    }
  }
  upload<T>(path: string, file: File): Promise<T> {
    const body = new FormData();
    body.append('file', file);
    return this.request<T>(path, 'POST', body);
  }
}
