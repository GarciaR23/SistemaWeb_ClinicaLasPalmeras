import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icono, NombreIcono } from '../icono/icono';

@Component({
  selector: 'app-estado-vacio',
  imports: [Icono],
  templateUrl: './estado-vacio.html',
  styleUrl: './estado-vacio.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstadoVacio {
  readonly icono = input.required<NombreIcono>();
  readonly titulo = input.required<string>();
  readonly descripcion = input('');
}
