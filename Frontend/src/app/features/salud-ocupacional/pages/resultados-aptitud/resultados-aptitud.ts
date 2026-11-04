import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { fechaCorta, iniciales } from '../../../../core/utils/formato';
import { Icon } from '../../../../shared/components/icono/icono';
import { Modal } from '../../../../shared/components/modal/modal';
import {
  CONCLUSIONES,
  Conclusion,
  FilaAptitud,
} from '../../models/resultado-aptitud';
import { ServicioSaludOcupacional } from '../../services/servicio-salud';

@Component({
  selector: 'app-resultados-aptitud',
  standalone: true,
  imports: [FormsModule, Icon, Modal],
  templateUrl: './resultados-aptitud.html',
  styleUrl: './resultados-aptitud.scss',
})
export class ResultadosAptitud implements OnInit {
  readonly servicio = inject(ServicioSaludOcupacional);

  readonly conclusiones = CONCLUSIONES;

  loading = true;
  saving = false;
  error = '';
  notice = '';

  seleccion: FilaAptitud | null = null;
  formError = '';
  form: { conclusion: Conclusion; note: string } = {
    conclusion: 'Apto',
    note: '',
  };

  async ngOnInit(): Promise<void> {
    try {
      await this.servicio.cargar();
    } catch (error) {
      this.error = this.mensaje(error, 'No se pudieron cargar los resultados.');
    } finally {
      this.loading = false;
    }
  }

  iniciales(nombre: string): string {
    return iniciales(nombre);
  }

  fecha(fila: FilaAptitud): string {
    return fila.fecha ? fechaCorta(fila.fecha) : '—';
  }

  tono(conclusion: string): string {
    if (conclusion === 'Apto') return 'ok';

    return conclusion === 'No apto' ? 'bad' : 'warn';
  }

  abrir(fila: FilaAptitud): void {
    this.seleccion = fila;
    this.formError = '';
    this.form = { conclusion: 'Apto', note: '' };
  }

  cerrar(): void {
    if (this.saving) return;

    this.seleccion = null;
  }

  async guardar(formulario: NgForm): Promise<void> {
    if (this.saving || !this.seleccion) return;

    formulario.control.markAllAsTouched();
    this.formError = '';

    this.saving = true;

    try {
      const fila = this.seleccion;

      await this.servicio.registrarAptitud({
        applicationId: fila.applicationId,
        conclusion: this.form.conclusion,
        note: this.form.note,
      });

      this.seleccion = null;
      this.error = '';
      this.notice = `Aptitud registrada para ${fila.nombre}: ${this.form.conclusion}. RR. HH. podrá consultar la conclusión autorizada.`;
    } catch (error) {
      this.formError = this.mensaje(error, 'No se pudo registrar el resultado.');
    } finally {
      this.saving = false;
    }
  }

  private mensaje(error: unknown, alternativo: string): string {
    return error instanceof Error ? error.message : alternativo;
  }
}
