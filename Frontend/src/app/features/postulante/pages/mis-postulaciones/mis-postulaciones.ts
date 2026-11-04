import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { LineaProgreso } from '../../components/linea-progreso/linea-progreso';
import { ETAPAS_POSTULACION } from '../../models/postulacion';
import { ServicioPostulaciones } from '../../services/servicio-postulaciones';

@Component({
  selector: 'app-mis-postulaciones',
  imports: [DatePipe, RouterLink, EstadoVacio, LineaProgreso],
  templateUrl: './mis-postulaciones.html',
  styleUrl: './mis-postulaciones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisPostulaciones {
  protected readonly postulaciones = inject(ServicioPostulaciones).lista;
  protected readonly etapas = ETAPAS_POSTULACION;
}
