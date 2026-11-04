import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type NombreIcono =
  | 'cruz' | 'maletin' | 'calendario' | 'campana' | 'documento' | 'estetoscopio'
  | 'grafico' | 'ubicacion' | 'check' | 'buscar' | 'chevron';

/** Iconos de trazo (estilo lucide). Si ya tienes un componente de iconos en shared, puedes reemplazar este. */
@Component({
  selector: 'app-icono',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="tamano()" [attr.height]="tamano()" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @switch (nombre()) {
        @case ('cruz') { <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" /> }
        @case ('maletin') { <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /> }
        @case ('calendario') { <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /> }
        @case ('campana') { <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" /> }
        @case ('documento') { <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" /><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8" /> }
        @case ('estetoscopio') { <path d="M11 2v2M5 2v2M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1M8 15a6 6 0 0 0 12 0v-3" /><circle cx="20" cy="10" r="2" /> }
        @case ('grafico') { <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 17v-6M12 17V7M16 17v-3" /> }
        @case ('ubicacion') { <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /> }
        @case ('check') { <path d="M20 6 9 17l-5-5" /> }
        @case ('buscar') { <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /> }
        @case ('chevron') { <path d="m9 18 6-6-6-6" /> }
      }
    </svg>
  `,
  styles: `:host { display: inline-flex; line-height: 0; }`,
})
export class Icono {
  readonly nombre = input.required<NombreIcono>();
  readonly tamano = input(20);
}
