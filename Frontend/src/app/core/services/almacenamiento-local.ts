import { Injectable } from '@angular/core';
export interface LocalAudit {
    id: number;
    action: string;
    email: string;
    createdAt: string;
    name?: string;
    module?: string;
    timestamp?: number;
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
    write<T>(key: string, value: T, audit = true): void {
        localStorage.setItem('palmeras.login-rrhh.' + key, JSON.stringify(value));
        if (!audit) return;
        const names: Record<string, { action: string; module: string }> = {
            accounts: { action: 'Actualización de usuarios', module: 'Seguridad' },
            candidates: { action: 'Actualización de postulaciones', module: 'Postulaciones' },
            vacancies: { action: 'Actualización de vacantes', module: 'Vacantes' },
            interviews: { action: 'Programación de entrevistas', module: 'Entrevistas' },
            evaluations: { action: 'Evaluación laboral', module: 'Entrevistas' },
            medical: { action: 'Programación de exámenes', module: 'Salud Ocupacional' },
            fitness: { action: 'Resultado de aptitud', module: 'Salud Ocupacional' },
        };
        if (key.startsWith('preferences.')) {
            this.audit('Actualización de preferencias', 'Configuración');
            return;
        }
        const entry = names[key];
        if (entry) this.audit(entry.action, entry.module);
    }

    /** Registra un evento en la auditoría local de la demostración. */
    audit(action: string, module: string): void {
        let email = 'Demostración';
        let name: string | undefined;
        try {
            const session = JSON.parse(
                sessionStorage.getItem('palmeras.login-rrhh.sesion') || '{}',
            ) as { email?: string; name?: string };
            email = session.email || email;
            name = session.name;
        } catch {
            /* A session is optional for the demo log. */
        }
        const entries = this.read<LocalAudit[]>('audit', []);
        const now = new Date();
        localStorage.setItem(
            'palmeras.login-rrhh.audit',
            JSON.stringify(
                [
                    {
                        id: nextId(entries),
                        action,
                        email,
                        name,
                        module,
                        timestamp: now.getTime(),
                        createdAt: now.toLocaleString('es-PE', { timeZone: 'America/Lima' }),
                    },
                    ...entries,
                ].slice(0, 200),
            ),
        );
    }
}
export function nextId(items: { id: number }[]): number {
    return Math.max(0, ...items.map((x) => x.id)) + 1;
}
export function today(): string {
    return new Date().toLocaleDateString('es-PE', { timeZone: 'America/Lima' });
}
