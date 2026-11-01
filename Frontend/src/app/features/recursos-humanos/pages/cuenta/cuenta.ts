import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  Session,
  ROLE_LABELS,
} from '../../../../core/services/sesion';
import { ApiClient } from '../../../../core/services/cliente-api';
import { PreferencesService } from '../../services/servicio-preferencias';
import { Icon } from '../../../../shared/components/icono/icono';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [FormsModule, Icon],
  templateUrl: './cuenta.html',
  styleUrl: './cuenta.scss',
})
export class AccountPage implements OnInit {
  readonly session = inject(Session);
  readonly preferences = inject(PreferencesService);

  private readonly api = inject(ApiClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly labels = ROLE_LABELS;

  mode = this.route.snapshot.data['mode'] as string;

  loading = true;
  busy = false;
  error = '';
  notice = '';

  firstName = '';
  lastName = '';

  draft = {
    name: this.session.user()?.name || '',
    phone: '',
    location: '',
    dni: '',
    experience: '',
  };

  appearance = { ...this.preferences.preferences() };

  get roleLabel(): string {
    const role = this.session.role();

    return role ? this.labels[role] : '';
  }

  get initials(): string {
    return (this.session.user()?.name ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  async ngOnInit(): Promise<void> {
    try {
      if (this.mode === 'settings') {
        await this.preferences.load();

        this.appearance = {
          ...this.preferences.preferences(),
        };
      } else {
        const account = environment.demoMode
          ? this.session
              .accounts()
              .find(
                (item) =>
                  item.email === this.session.user()?.email,
              )
          : await this.api.request<typeof this.draft>('/cuenta');

        if (account) {
          this.draft = {
            name: account.name ?? this.draft.name,
            phone: account.phone ?? '',
            location: account.location ?? '',
            dni: account.dni ?? '',
            experience: account.experience ?? '',
          };
        }

        this.splitName();
      }
    } catch {
      this.error = 'No se pudo cargar la cuenta.';
    } finally {
      this.loading = false;
    }
  }

  async save(form: NgForm): Promise<void> {
    if (this.busy || this.loading) return;

    form.control.markAllAsTouched();

    this.error = '';
    this.notice = '';

    if (form.invalid) return;

    if (this.mode !== 'settings') {
      const firstName = this.cleanText(this.firstName);
      const lastName = this.cleanText(this.lastName);

      if (!firstName || !lastName) {
        this.error = 'Completa el nombre y los apellidos.';
        return;
      }

      this.firstName = firstName;
      this.lastName = lastName;

      this.draft = {
        ...this.draft,
        name: `${firstName} ${lastName}`,
        phone: this.draft.phone.trim(),
        location: this.cleanText(this.draft.location),
        dni: this.draft.dni.trim(),
        experience: this.draft.experience.trim(),
      };
    }

    this.busy = true;

    try {
      if (this.mode === 'settings') {
        await this.preferences.save(this.appearance);
      } else {
        await this.session.updateAccount(this.draft);
      }

      this.notice = 'Cambios guardados correctamente.';
      form.form.markAsPristine();
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudieron guardar los cambios.';
    } finally {
      this.busy = false;
    }
  }

  logout(): void {
    if (this.busy) return;

    this.session.logout();
    void this.router.navigateByUrl('/iniciar-sesion');
  }

  private splitName(): void {
    // El modelo actual guarda el nombre completo en un solo campo.
    // Esta separación inicial puede corregirse en el formulario.
    const parts = this.draft.name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    this.firstName = parts.shift() ?? '';
    this.lastName = parts.join(' ');
  }

  private cleanText(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }
}