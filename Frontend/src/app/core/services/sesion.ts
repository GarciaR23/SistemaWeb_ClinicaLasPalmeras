import { computed, inject, Injectable, signal } from '@angular/core';
import { LocalStore } from './almacenamiento-local';
import { Account, SessionUser, ROLE_HOME } from './modelos-sesion';
export { type Account, type SessionUser, type UserRole, ROLE_LABELS } from './modelos-sesion';
@Injectable({ providedIn: 'root' })
export class Session {
    private store = inject(LocalStore);
    readonly user = signal<SessionUser | null>(null);
    readonly accounts = signal<Account[]>(this.store.read<Account[]>('perfiles', []));
    readonly role = computed(() => this.user()?.role);
    readonly demo = true;
    constructor() {
        try {
            const raw = sessionStorage.getItem('palmeras.login-rrhh.sesion');
            if (raw) {
                const value = JSON.parse(raw) as SessionUser;
                if (value.email && value.name && Object.hasOwn(ROLE_HOME, value.role)) this.user.set(value);
            }
        } catch {
            sessionStorage.removeItem('palmeras.login-rrhh.sesion');
        }
    }
    establish(user: SessionUser) {
        sessionStorage.setItem('palmeras.login-rrhh.sesion', JSON.stringify(user));
        this.user.set(user);
    }
    home() {
        return this.user() ? ROLE_HOME[this.user()!.role] : '/iniciar-sesion';
    }
    async restore() { }
    async loadAccounts() { }
    async updateAccount(data: Partial<Account>) {
        const user = this.user();
        if (!user) return;
        const existing = this.accounts().find((a) => a.email === user.email);
        const account: Account = {
            id: existing?.id || this.accounts().length + 1,
            name: data.name?.trim() || user.name,
            email: user.email,
            role: user.role,
            active: true,
            lastAccess: '—',
            phone: data.phone,
            location: data.location,
            dni: data.dni,
            experience: data.experience,
        };
        const items = [...this.accounts().filter((a) => a.email !== user.email), account];
        this.store.write('perfiles', items);
        this.accounts.set(items);
        this.establish({ email: user.email, role: user.role, name: account.name });
    }
    logout() {
        sessionStorage.removeItem('palmeras.login-rrhh.sesion');
        sessionStorage.removeItem('palmeras_token');
        this.user.set(null);
    }
}
