import { Component, inject, OnInit } from '@angular/core';

import {
  formatearFechaHora,
  iniciales,
} from '../../../../core/utils/formato';
import { Icon } from '../../../../shared/components/icono/icono';
import { RegistroAuditoria } from '../../models/registro-auditoria';
import { ServicioAuditoria } from '../../services/servicio-auditoria';

interface EventoAuditoria {
  registro: RegistroAuditoria;
  hora: string;
  icono: string;
  modulo: string;
  tono: string;
  iniciales: string;
}

interface GrupoAuditoria {
  dia: string;
  eventos: EventoAuditoria[];
}

interface ResumenModulo {
  nombre: string;
  clave: string;
  tono: string;
  total: number;
}

const SIN_FECHA = 'Sin fecha';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [Icon],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.scss',
})
export class Auditoria implements OnInit {
  private readonly servicio = inject(ServicioAuditoria);

  registros: RegistroAuditoria[] = [];
  modulos: ResumenModulo[] = [];
  grupos: GrupoAuditoria[] = [];
  moduloActivo = 'todos';

  loading = true;
  error = '';

  async ngOnInit(): Promise<void> {
    try {
      this.registros = await this.servicio.listar();
      this.modulos = this.resumirModulos(this.registros);
      this.agrupar();
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudo cargar la auditoría.';
    } finally {
      this.loading = false;
    }
  }

  filtrarPor(clave: string): void {
    this.moduloActivo = clave;
    this.agrupar();
  }

  /** Clave estable de un módulo ("Salud Ocupacional" → "salud-ocupacional"). */
  clave(modulo: string): string {
    return (
      modulo
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, '-') || 'general'
    );
  }

  /** Color de cada módulo (mismas familias que Postulante). */
  tono(clave: string): string {
    const tonos: Record<string, string> = {
      postulaciones: 'azul',
      'salud-ocupacional': 'verde',
      seguridad: 'violeta',
      vacantes: 'celeste',
    };

    return tonos[clave] ?? 'gris';
  }

  private agrupar(): void {
    const visibles = this.registros.filter(
      (registro) =>
        this.moduloActivo === 'todos' ||
        this.clave(registro.modulo) === this.moduloActivo,
    );

    const grupos: GrupoAuditoria[] = [];

    for (const registro of visibles) {
      const { dia, hora } = this.partesFecha(registro);
      let grupo = grupos.find((g) => g.dia === dia);

      if (!grupo) {
        grupo = { dia, eventos: [] };
        grupos.push(grupo);
      }

      grupo.eventos.push({
        registro,
        hora,
        icono: this.iconoAccion(registro.accion),
        modulo: this.clave(registro.modulo),
        tono: this.tono(this.clave(registro.modulo)),
        iniciales: iniciales(registro.responsable),
      });
    }

    this.grupos = grupos;
  }

  private resumirModulos(registros: RegistroAuditoria[]): ResumenModulo[] {
    const cuenta = new Map<string, ResumenModulo>();

    for (const registro of registros) {
      const clave = this.clave(registro.modulo);
      const actual = cuenta.get(clave);

      if (actual) actual.total += 1;
      else {
        cuenta.set(clave, {
          nombre: registro.modulo,
          clave,
          tono: this.tono(clave),
          total: 1,
        });
      }
    }

    return [...cuenta.values()].sort((a, b) => b.total - a.total);
  }

  /** Separa "Hoy · 09:42" en día ("Hoy") y hora ("09:42"). */
  private partesFecha(registro: RegistroAuditoria): {
    dia: string;
    hora: string;
  } {
    const texto =
      formatearFechaHora(registro.marca) ??
      formatearFechaHora(registro.fechaTexto);

    if (!texto) return { dia: SIN_FECHA, hora: registro.fechaTexto || '—' };

    const [dia, hora] = texto.split(' · ');

    return { dia, hora: hora ?? '' };
  }

  /** Ícono según el tipo de acción realizada. */
  private iconoAccion(accion: string): string {
    const texto = accion
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (/preselecc|aprob|contrat/.test(texto)) return 'check';
    if (/resultado|aptitud|medic/.test(texto)) return 'medical';
    if (/public|vacante/.test(texto)) return 'briefcase';
    if (/program|entrevista|examen|agenda/.test(texto)) return 'calendar';
    if (/permiso|cuenta|usuario|activ|cre[oó]/.test(texto)) return 'user';
    if (/configur|ajust/.test(texto)) return 'settings';

    return 'file';
  }
}
