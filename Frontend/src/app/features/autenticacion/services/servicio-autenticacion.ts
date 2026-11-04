import { inject, Injectable } from '@angular/core';

import { Session } from '../../../core/services/sesion';
import {
  LocalStore,
  nextId,
} from '../../../core/services/almacenamiento-local';
import { Account, UserRole } from '../../../core/services/modelos-sesion';

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
  private readonly claveTrabajadores = 'cuentas-trabajadores';
  private readonly claveEstados = 'cuentas-estado';
  private readonly claveAccesos = 'cuentas-ultimo-acceso';

  private obtenerCuentas(): CuentaLocal[] {
    const registradas = this.storage.read<CuentaLocal[]>(
      this.claveCuentas,
      [],
    );

    const trabajadores = this.storage.read<CuentaLocal[]>(
      this.claveTrabajadores,
      [],
    );

    const estados = this.storage.read<Record<string, boolean>>(
      this.claveEstados,
      {},
    );

    const accesos = this.storage.read<Record<string, string>>(
      this.claveAccesos,
      {},
    );

    return [
      ...CUENTAS_DEMOSTRACION,
      ...registradas,
      ...trabajadores,
    ].map((cuenta) => ({
      ...cuenta,
      active: estados[cuenta.email] ?? cuenta.active,
      lastAccess: accesos[cuenta.email] ?? cuenta.lastAccess,
    }));
  }

  /** Cuentas sin contraseña, con los estados y accesos vigentes. */
  listarCuentas(): Account[] {
    const perfiles = this.session.accounts();

    return this.obtenerCuentas().map(
      ({ password: _password, ...cuenta }) => {
        const perfil = perfiles.find(
          (item) => item.email === cuenta.email,
        );

        return {
          ...cuenta,
          name: perfil?.name || cuenta.name,
          phone: perfil?.phone ?? cuenta.phone,
        };
      },
    );
  }

  /**
   * Crea una cuenta de personal con credenciales temporales.
   * Con el backend, el servidor generará el acceso y enviará la invitación.
   */
  crearCuentaTrabajador(
    name: string,
    role: UserRole,
  ): { account: Account; temporaryPassword: string } {
    const nombre = name.trim().replace(/\s+/g, ' ');

    if (nombre.length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres.');
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

    if (role === 'applicant') {
      throw new Error(
        'Los postulantes se registran desde el portal público.',
      );
    }

    const cuentas = this.obtenerCuentas();
    const partes = nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z ]/g, '')
      .split(' ')
      .filter(Boolean);

    const base =
      partes.length > 1
        ? `${partes[0]}.${partes[partes.length - 1]}`
        : partes[0];

    let correo = `${base}@clinicapalmeras.com`;
    let contador = 2;

    while (cuentas.some((cuenta) => cuenta.email === correo)) {
      correo = `${base}${contador++}@clinicapalmeras.com`;
    }

    const temporaryPassword = this.generarClaveTemporal();

    const nueva: CuentaLocal = {
      id: nextId(cuentas),
      name: nombre,
      email: correo,
      password: temporaryPassword,
      role,
      active: true,
      lastAccess: '—',
    };

    this.storage.write(this.claveTrabajadores, [
      ...this.storage.read<CuentaLocal[]>(this.claveTrabajadores, []),
      nueva,
    ]);

    const { password: _password, ...account } = nueva;

    return { account, temporaryPassword };
  }

  cambiarEstadoCuenta(email: string, active: boolean): void {
    if (!active && this.session.user()?.email === email) {
      throw new Error('No puedes desactivar tu propia cuenta.');
    }

    const estados = this.storage.read<Record<string, boolean>>(
      this.claveEstados,
      {},
    );

    this.storage.write(this.claveEstados, {
      ...estados,
      [email]: active,
    });
  }

  private generarClaveTemporal(): string {
    const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    const valores = crypto.getRandomValues(new Uint32Array(10));

    return Array.from(
      valores,
      (valor) => alfabeto[valor % alfabeto.length],
    ).join('');
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

    this.storage.write(this.claveAccesos, {
      ...this.storage.read<Record<string, string>>(this.claveAccesos, {}),
      [account.email]: new Date().toISOString(),
    });

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