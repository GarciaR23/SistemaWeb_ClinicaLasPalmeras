import { inject, Injectable } from '@angular/core';

import { Session } from '../../../core/services/sesion';
import {
  LocalStore,
  nextId,
} from '../../../core/services/almacenamiento-local';
import { Account } from '../../../core/services/modelos-sesion';

import { CUENTAS_DEMOSTRACION } from '../models/cuentas';

type CuentaLocal = Account & {
  password: string;
};

@Injectable({
  providedIn: 'root',
})
export class ServicioAutenticacion {
  private session = inject(Session);
  private storage = inject(LocalStore);

  private readonly claveCuentas = 'cuentas-postulantes';

  private obtenerCuentas(): CuentaLocal[] {
    const registradas = this.storage.read<CuentaLocal[]>(
      this.claveCuentas,
      [],
    );

    return [...CUENTAS_DEMOSTRACION, ...registradas];
  }

  async ingresar(
    email: string,
    password: string,
  ): Promise<string> {
    const correo = email.trim().toLowerCase();

    const account = this.obtenerCuentas().find(
      (cuenta) =>
        cuenta.email === correo &&
        cuenta.password === password &&
        cuenta.active,
    );

    if (!account) {
      throw new Error('Correo o contraseña incorrectos.');
    }

    const profile = this.session.accounts().find(
      (cuenta) => cuenta.email === account.email,
    );

    this.session.establish({
      role: account.role,
      email: account.email,
      name: profile?.name || account.name,
    });

    return this.session.home();
  }

  async registrar(
    name: string,
    email: string,
    password: string,
  ): Promise<string> {
    const nombre = name.trim();
    const correo = email.trim().toLowerCase();

    if (nombre.length < 3) {
      throw new Error(
        'El nombre debe tener al menos 3 caracteres.',
      );
    }

    if (
      !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/.test(
        nombre,
      )
    ) {
      throw new Error(
        'El nombre solo puede incluir letras, espacios, apóstrofos o guiones.',
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      throw new Error('Ingresa un correo electrónico válido.');
    }

    if (/\s/.test(password)) {
      throw new Error(
        'La contraseña no puede contener espacios ni tabulaciones.',
      );
    }

    if (password.length < 6) {
      throw new Error(
        'La contraseña debe tener al menos 6 caracteres.',
      );
    }

    const cuentas = this.obtenerCuentas();

    if (cuentas.some((cuenta) => cuenta.email === correo)) {
      throw new Error('Este correo ya está registrado.');
    }

    const nuevaCuenta: CuentaLocal = {
      id: nextId(cuentas),
      name: nombre,
      email: correo,
      password,
      role: 'applicant',
      active: true,
      lastAccess: '—',
    };

    const registradas = this.storage.read<CuentaLocal[]>(
      this.claveCuentas,
      [],
    );

    this.storage.write(this.claveCuentas, [
      ...registradas,
      nuevaCuenta,
    ]);

    return this.ingresar(correo, password);
  }
}