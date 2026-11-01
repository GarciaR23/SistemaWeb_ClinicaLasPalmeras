import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { Icon } from '../../../../shared/components/icono/icono';
import {
  ServicioAutenticacion,
} from '../../services/servicio-autenticacion';

type Pantalla = 'login' | 'recuperar' | 'registro';

@Component({
  selector: 'app-iniciar-sesion',
  standalone: true,
  imports: [FormsModule, Icon],
  templateUrl: './iniciar-sesion.html',
  styleUrl: './iniciar-sesion.scss',
})
export class IniciarSesion {
  private auth = inject(ServicioAutenticacion);
  private router = inject(Router);

  pantalla: Pantalla = 'login';

  name = '';
  email = '';
  password = '';
  mostrarContrasena = false;

  error = '';
  mensaje = '';
  busy = false;

  get seguridadContrasena(): {
    nivel: string;
    clase: string;
    puntaje: number;
  } | null {
    if (this.pantalla !== 'registro' || !this.password) {
      return null;
    }

    const puntaje = [
      this.password.length >= 8,
      /[a-z]/.test(this.password),
      /[A-Z]/.test(this.password),
      /\d/.test(this.password),
      /[^A-Za-z0-9]/.test(this.password),
    ].filter(Boolean).length;

    if (puntaje <= 2) {
      return { nivel: 'Débil', clase: 'strength-weak', puntaje };
    }

    if (puntaje <= 4) {
      return { nivel: 'Media', clase: 'strength-medium', puntaje };
    }

    return { nivel: 'Fuerte', clase: 'strength-strong', puntaje };
  }

  get titulo(): string {
    switch (this.pantalla) {
      case 'registro':
        return 'Crear cuenta';

      case 'recuperar':
        return 'Recuperar contraseña';

      default:
        return 'Iniciar sesión';
    }
  }

  get descripcion(): string {
    switch (this.pantalla) {
      case 'registro':
        return 'Regístrate para acceder al portal de selección.';

      case 'recuperar':
        return 'Ingresa el correo asociado a tu cuenta.';

      default:
        return 'Accede a la plataforma con tu correo y contraseña.';
    }
  }

  get textoBoton(): string {
    if (this.busy) {
      return 'Procesando…';
    }

    switch (this.pantalla) {
      case 'registro':
        return 'CREAR CUENTA';

      case 'recuperar':
        return 'ENVIAR ENLACE';

      default:
        return 'INGRESAR';
    }
  }

  cambiarPantalla(
    pantalla: Pantalla,
    formulario: NgForm,
  ): void {
    if (this.busy) return;

    formulario.resetForm();

    this.pantalla = pantalla;
    this.name = '';
    this.email = '';
    this.password = '';
    this.mostrarContrasena = false;
    this.error = '';
    this.mensaje = '';
  }

  bloquearEspacio(event: KeyboardEvent): void {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  async submit(formulario: NgForm): Promise<void> {
    if (this.busy) return;

    this.error = '';
    this.mensaje = '';

    if (formulario.invalid) {
      formulario.control.markAllAsTouched();
      return;
    }

    if (this.pantalla === 'recuperar') {
      this.mensaje =
        'El envío de recuperación todavía no está habilitado. ' +
        'Se conectará con el backend. Por ahora, contacta al administrador.';

      return;
    }

    this.busy = true;

    try {
      const destino =
        this.pantalla === 'registro'
          ? await this.auth.registrar(
              this.name.trim(),
              this.email.trim(),
              this.password,
            )
          : await this.auth.ingresar(
              this.email.trim(),
              this.password,
            );

      await this.router.navigateByUrl(destino);
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudo completar la operación.';
    } finally {
      this.busy = false;
    }
  }
}