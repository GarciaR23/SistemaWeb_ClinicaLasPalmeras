import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { Icono } from '../../components/icono/icono';
import { TarjetaVacante } from '../../components/tarjeta-vacante/tarjeta-vacante';
import { Vacante } from '../../models/vacante';
import { ServicioPostulaciones } from '../../services/servicio-postulaciones';
import { ServicioVacantes } from '../../services/servicio-vacantes';

const normalizar = (t: string) => t.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

@Component({
  selector: 'app-vacantes',
  imports: [TarjetaVacante, EstadoVacio, Icono],
  templateUrl: './vacantes.html',
  styleUrl: './vacantes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Vacantes {
  private readonly servicioVacantes = inject(ServicioVacantes);
  private readonly servicioPostulaciones = inject(ServicioPostulaciones);

  protected readonly busqueda = signal('');
  protected readonly vacantes = computed(() => {
    const texto = normalizar(this.busqueda().trim());
    return this.servicioVacantes.lista().filter((v) => normalizar(`${v.titulo} ${v.area}`).includes(texto));
  });

  protected yaPostulo(id: number): boolean {
    return this.servicioPostulaciones.yaPostulo(id);
  }

  protected postular(vacante: Vacante): void {
    this.servicioPostulaciones.postular(vacante);
  }
}
