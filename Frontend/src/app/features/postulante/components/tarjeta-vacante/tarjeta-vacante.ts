import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Vacante } from '../../models/vacante';
import { Icono } from '../icono/icono';

@Component({
  selector: 'app-tarjeta-vacante',
  imports: [DatePipe, Icono],
  templateUrl: './tarjeta-vacante.html',
  styleUrl: './tarjeta-vacante.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarjetaVacante {
  readonly vacante = input.required<Vacante>();
  readonly yaPostulado = input(false);
  readonly postular = output<Vacante>();
  readonly verDetalle = output<Vacante>();
}
