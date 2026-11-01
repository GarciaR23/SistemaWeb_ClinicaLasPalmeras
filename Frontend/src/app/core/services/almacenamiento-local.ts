import { Injectable } from '@angular/core';
export interface LocalAudit {
    id: number;
    action: string;
    email: string;
    createdAt: string;
}
@Injectable({ providedIn: 'root' })
export class LocalStore {
    read<T>(key: string, fallback: T): T {
        try {
            const raw = localStorage.getItem('palmeras.login-rrhh.' + key);
            return raw ? (JSON.parse(raw) as T) : structuredClone(fallback);
        } catch {
            return structuredClone(fallback);
        }
    }
    write<T>(key: string, value: T): void {
        localStorage.setItem('palmeras.login-rrhh.' + key, JSON.stringify(value));
        const names: Record<string, string> = {
            accounts: 'Actualización de usuarios',
            candidates: 'Actualización de postulaciones',
            vacancies: 'Actualización de vacantes',
            interviews: 'Programación de entrevistas',
            evaluations: 'Evaluación laboral',
            medical: 'Programación de exámenes',
            fitness: 'Resultado de aptitud',
        };
        const action = key.startsWith('preferences.') ? 'Actualización de preferencias' : names[key];
        if (action) {
            let email = 'Demostración';
            try {
                email =
                    (
                        JSON.parse(sessionStorage.getItem('palmeras.login-rrhh.session') || '{}') as {
                            email?: string;
                        }
                    ).email || email;
            } catch {
                /* A session is optional for the demo log. */
            }
            const entries = this.read<LocalAudit[]>('audit', []);
            localStorage.setItem(
                'palmeras.login-rrhh.audit',
                JSON.stringify(
                    [
                        {
                            id: nextId(entries),
                            action,
                            email,
                            createdAt: new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' }),
                        },
                        ...entries,
                    ].slice(0, 200),
                ),
            );
        }
    }
}
export function nextId(items: { id: number }[]): number {
    return Math.max(0, ...items.map((x) => x.id)) + 1;
}
export function today(): string {
    return new Date().toLocaleDateString('es-PE', { timeZone: 'America/Lima' });
}
