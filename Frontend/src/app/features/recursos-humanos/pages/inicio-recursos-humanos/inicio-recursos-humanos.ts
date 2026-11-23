import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DashboardService } from '../../services/servicio-dashboard';
import { VacanciesService } from '../../services/servicio-vacantes';
import { ApplicantsService } from '../../services/servicio-postulantes';
import { Icon } from '../../../../shared/components/icono/icono';
import { AvatarPostulante } from '../../../../shared/components/avatar-postulante/avatar-postulante';

export type ChartViewMode = 'etapas' | 'puestos' | 'vacantes';

export interface ChartBarItem {
  nombre: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

@Component({
  selector: 'app-inicio-recursos-humanos',
  standalone: true,
  imports: [Icon, RouterLink, AvatarPostulante],
  templateUrl: './inicio-recursos-humanos.html',
  styleUrl: './inicio-recursos-humanos.scss',
})
export class InicioRecursosHumanos implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly vacanciesService = inject(VacanciesService);
  private readonly applicantsService = inject(ApplicantsService);

  resumen = this.dashboardService.obtenerResumen();
  loading = true;
  error = '';
  readonly circunferencia = 2 * Math.PI * 72;
  readonly coloresEtapas = ['#3b82f6', '#14b8a6', '#f59e0b', '#8b5cf6', '#10b981'];
  etapaSeleccionada = 0;
  chartView: ChartViewMode = 'etapas';
  barsProgress = 0;

  animatedValues: number[] = [];
  ringProgress = 0;
  private animFrameId = 0;

  async ngOnInit(): Promise<void> {
    this.animatedValues = this.resumen.indicadores.map(() => 0);

    try {
      await Promise.all([
        this.dashboardService.cargar(),
        this.vacanciesService.load(),
        this.applicantsService.load(),
      ]);
      this.resumen = this.dashboardService.obtenerResumen();
    } catch {
      this.error = 'No se pudo actualizar el resumen. Se muestran los datos disponibles.';
    } finally {
      this.loading = false;
      this.startEntranceAnimations();
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animFrameId);
  }

  get totalEtapas(): number {
    return this.resumen.etapas.reduce((total, item) => total + item.cantidad, 0);
  }

  get etapaActiva() {
    return this.resumen.etapas[this.etapaSeleccionada] ?? this.resumen.etapas[0];
  }

  get candidatosRecientes() {
    return this.applicantsService.candidates().slice(0, 6);
  }

  longitudSegmento(index: number): number {
    if (!this.totalEtapas) return 0;
    return (
      (this.resumen.etapas[index].cantidad / this.totalEtapas) *
      this.circunferencia *
      this.ringProgress
    );
  }

  desplazamientoSegmento(index: number): number {
    const acumulado = this.resumen.etapas
      .slice(0, index)
      .reduce((total, item) => total + item.cantidad, 0);
    return (
      -(acumulado / Math.max(1, this.totalEtapas)) *
      this.circunferencia *
      this.ringProgress
    );
  }

  seleccionarEtapa(index: number): void {
    this.etapaSeleccionada = index;
  }

  cambiarVistaGrafico(mode: ChartViewMode): void {
    if (this.chartView === mode) return;
    this.chartView = mode;
    this.animateChartOnly();
  }

  get postulantesPorPuesto(): ChartBarItem[] {
    const counts = new Map<string, number>();
    for (const c of this.applicantsService.candidates()) {
      const key = c.role || 'Sin puesto';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const entries = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const max = Math.max(1, ...entries.map(([, n]) => n));
    const palette = ['#0f223f', '#1a435a', '#14b8a6', '#3b82f6', '#8b5cf6'];

    return entries.map(([nombre, cantidad], i) => ({
      nombre,
      cantidad,
      porcentaje: Math.round((cantidad / max) * 100),
      color: palette[i % palette.length],
    }));
  }

  get estadoVacantesGrafico(): ChartBarItem[] {
    const list = this.vacanciesService.vacancies();
    const abiertas = list.filter((v) => v.status === 'Publicada').length;
    const pausadas = list.filter((v) => v.status === 'Pausada').length;
    const cerradas = list.filter((v) => v.status === 'Cerrada').length;
    const total = Math.max(1, abiertas + pausadas + cerradas);

    return [
      { nombre: 'Abiertas', cantidad: abiertas, porcentaje: Math.round((abiertas / total) * 100), color: '#00c896' },
      { nombre: 'Pausadas', cantidad: pausadas, porcentaje: Math.round((pausadas / total) * 100), color: '#f59e0b' },
      { nombre: 'Cerradas', cantidad: cerradas, porcentaje: Math.round((cerradas / total) * 100), color: '#64748b' },
    ];
  }

  private animateChartOnly(): void {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      this.ringProgress = 1;
      this.barsProgress = 1;
      return;
    }

    this.ringProgress = 0;
    this.barsProgress = 0;
    const duration = 650;
    const start = performance.now();

    const step = (now: number): void => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      this.ringProgress = eased;
      this.barsProgress = eased;
      if (t < 1) {
        this.animFrameId = requestAnimationFrame(step);
      }
    };
    cancelAnimationFrame(this.animFrameId);
    this.animFrameId = requestAnimationFrame(step);
  }

  private startEntranceAnimations(): void {
    const targets = this.resumen.indicadores.map((i) => i.cantidad);
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      this.animatedValues = targets;
      this.ringProgress = 1;
      this.barsProgress = 1;
      return;
    }

    const duration = 900;
    const start = performance.now();

    const tick = (now: number): void => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);

      this.animatedValues = targets.map((target) => Math.round(target * eased));
      this.ringProgress = eased;
      this.barsProgress = eased;

      if (t < 1) {
        this.animFrameId = requestAnimationFrame(tick);
      } else {
        this.animatedValues = targets;
        this.ringProgress = 1;
        this.barsProgress = 1;
      }
    };

    cancelAnimationFrame(this.animFrameId);
    this.animFrameId = requestAnimationFrame(tick);
  }
}
