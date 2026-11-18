import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { ServicioEntrevistas } from '../../services/servicio-entrevistas';
import { Icono } from '../../components/icono/icono';
import { Entrevista } from '../../models/entrevista';

@Component({
  selector: 'app-mis-entrevistas',
  imports: [DatePipe, EstadoVacio, Icono],
  templateUrl: './mis-entrevistas.html',
  styleUrl: './mis-entrevistas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisEntrevistas {
  protected readonly entrevistas = inject(ServicioEntrevistas).lista;
  protected readonly copiadoId = signal<number | null>(null);

  protected obtenerDia(fecha: string): string {
    const parts = fecha.split('-');
    return parts[2] || '';
  }

  protected obtenerMes(fecha: string): string {
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'];
    const parts = fecha.split('-');
    const m = parseInt(parts[1], 10);
    return meses[m - 1] || '';
  }

  protected copiarLugar(e: Entrevista): void {
    if (navigator?.clipboard) {
      void navigator.clipboard.writeText(`${e.puesto} - ${e.fecha} ${e.hora}: ${e.lugar}`);
      this.copiadoId.set(e.id);
      setTimeout(() => this.copiadoId.set(null), 2500);
    }
  }

  protected agendarGoogle(e: Entrevista): void {
    const titulo = encodeURIComponent(`Entrevista Clínica Las Palmeras - ${e.puesto}`);
    const detalles = encodeURIComponent(`Entrevista para ${e.puesto} en Clínica Las Palmeras.\nLugar / Acceso: ${e.lugar}`);
    const ubicacion = encodeURIComponent(e.lugar);
    const start = e.fecha.replace(/-/g, '') + 'T' + e.hora.replace(/:/g, '') + '00';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&details=${detalles}&location=${ubicacion}&dates=${start}/${start}`;
    window.open(url, '_blank');
  }
}
