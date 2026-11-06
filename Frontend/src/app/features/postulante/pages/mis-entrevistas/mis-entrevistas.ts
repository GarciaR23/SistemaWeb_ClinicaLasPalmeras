import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { ServicioEntrevistas } from '../../services/servicio-entrevistas';
import { Icono } from '../../components/icono/icono';

@Component({
  selector: 'app-mis-entrevistas',
  imports: [DatePipe, EstadoVacio, Icono],
  templateUrl: './mis-entrevistas.html',
  styleUrl: './mis-entrevistas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisEntrevistas {
  protected readonly entrevistas = inject(ServicioEntrevistas).lista;
}
