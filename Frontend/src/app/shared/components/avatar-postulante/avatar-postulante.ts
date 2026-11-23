import { Component, Input } from '@angular/core';

const FOTOS = [
  'https://images.unsplash.com/photo-1758691462651-611d730c5272?auto=format&fit=crop&w=160&h=160&q=78&crop=faces',
  'https://images.unsplash.com/photo-1758691463333-c79215e8bc3b?auto=format&fit=crop&w=160&h=160&q=78&crop=faces',
  'https://images.unsplash.com/photo-1758691461916-dc7894eb8f94?auto=format&fit=crop&w=160&h=160&q=78&crop=faces',
  'https://images.unsplash.com/photo-1758691462878-6edc3d3da1be?auto=format&fit=crop&w=160&h=160&q=78&crop=faces',
  'https://images.unsplash.com/photo-1758691462370-cef1774278cd?auto=format&fit=crop&w=160&h=160&q=78&crop=faces',
];

@Component({
  selector: 'app-avatar-postulante',
  standalone: true,
  templateUrl: './avatar-postulante.html',
  styleUrl: './avatar-postulante.scss',
  host: { '[class.avatar-postulante--small]': 'size === "small"', '[class.avatar-postulante--large]': 'size === "large"' },
})
export class AvatarPostulante {
  @Input() id = 0;
  @Input() nombre = '';
  @Input() puesto = '';
  @Input() experiencia = '';
  @Input() ubicacion = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  get foto(): string { return FOTOS[Math.abs(this.id) % FOTOS.length]; }

  fallback(event: Event): void {
    const image = event.currentTarget as HTMLImageElement;
    image.onerror = null;
    image.src = '/assets/avatar-placeholder.svg';
  }
}
