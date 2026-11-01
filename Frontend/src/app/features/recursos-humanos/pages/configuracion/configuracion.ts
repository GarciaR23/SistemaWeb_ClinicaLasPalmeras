import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import {
  Preferences,
  PreferencesService,
} from '../../services/servicio-preferencias';
import { LocalStore } from '../../../../core/services/almacenamiento-local';
import { Icon } from '../../../../shared/components/icono/icono';
import { environment } from '../../../../../environments/environment';

interface Institution {
  name: string;
  email: string;
  phone: string;
  timezone: string;
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [FormsModule, Icon],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss',
})
export class Configuracion implements OnInit, OnDestroy {
  readonly preferences = inject(PreferencesService);

  private readonly store = inject(LocalStore);
  private savedAppearance: Preferences = {
    ...this.preferences.preferences(),
  };
  private appearanceSaved = false;

  readonly demoMode = environment.demoMode;

  appearance: Preferences = {
    ...this.preferences.preferences(),
  };

  institution: Institution = {
    name: 'Clínica Las Palmeras',
    email: 'rrhh@clinicapalmeras.com',
    phone: '',
    timezone: 'America/Lima',
  };

  loading = true;
  busy = false;
  error = '';
  notice = '';

  async ngOnInit(): Promise<void> {
    try {
      await this.preferences.load();

      this.appearance = {
        ...this.preferences.preferences(),
      };
      this.savedAppearance = {
        ...this.appearance,
      };

      if (this.demoMode) {
        this.institution = {
          ...this.institution,
          ...this.store.read<Partial<Institution>>(
            'institution-settings',
            {},
          ),
        };
      }
    } catch {
      this.error = 'No se pudo cargar toda la configuración.';
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    if (!this.appearanceSaved) {
      this.preferences.preferences.set({
        ...this.savedAppearance,
      });
    }
  }

  previewAppearance(): void {
    this.appearanceSaved = false;
    this.preferences.preferences.set({
      ...this.preferences.preferences(),
      ...this.appearance,
    });
  }

  setTheme(theme: Preferences['theme']): void {
    this.appearance.theme = theme;
    this.previewAppearance();
  }

  setTextSize(textSize: Preferences['textSize']): void {
    this.appearance.textSize = textSize;
    this.previewAppearance();
  }

  async save(form: NgForm): Promise<void> {
    if (this.busy || this.loading) return;

    form.control.markAllAsTouched();

    this.error = '';
    this.notice = '';

    if (form.invalid) return;

    const institution: Institution = {
      name: this.institution.name.trim().replace(/\s+/g, ' '),
      email: this.institution.email.trim(),
      phone: this.institution.phone.trim(),
      timezone: this.institution.timezone,
    };

    if (this.demoMode && !institution.name) {
      this.error = 'Ingresa el nombre de la institución.';
      return;
    }

    this.busy = true;

    try {
      await this.preferences.save({
        ...this.appearance,
      });
      this.savedAppearance = {
        ...this.appearance,
      };
      this.appearanceSaved = true;

      if (this.demoMode) {
        try {
          this.store.write(
            'institution-settings',
            institution,
          );

          this.institution = institution;
        } catch {
          this.error =
            'Las preferencias se guardaron, pero no se pudieron guardar los datos institucionales.';
          return;
        }
      }

      this.notice = 'Configuración guardada correctamente.';
      form.form.markAsPristine();
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudo guardar la configuración.';
    } finally {
      this.busy = false;
    }
  }
}