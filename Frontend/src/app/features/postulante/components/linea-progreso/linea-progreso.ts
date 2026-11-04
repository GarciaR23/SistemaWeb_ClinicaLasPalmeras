import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icono } from '../icono/icono';

@Component({
  selector: 'app-linea-progreso',
  imports: [Icono],
  templateUrl: './linea-progreso.html',
  styleUrl: './linea-progreso.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineaProgreso {
  readonly etapas = input.required<readonly string[]>();
  /** Índice (desde 0) de la etapa actual. Las etapas hasta ella se marcan como completadas. */
  readonly etapaActual = input.required<number>();
}
