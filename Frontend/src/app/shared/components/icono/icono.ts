import { Component, input } from '@angular/core';
@Component({
    selector: 'app-icon',
    styleUrl: './icono.scss',
    template: `<svg
    aria-hidden="true"
    class="icon"
    [attr.width]="size()"
    [attr.height]="size()"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    @switch (name()) {
      @case ('grid') {
        <rect x="3" y="3" width="6" height="6" rx="1" />
        <rect x="15" y="3" width="6" height="6" rx="1" />
        <rect x="3" y="15" width="6" height="6" rx="1" />
        <rect x="15" y="15" width="6" height="6" rx="1" />
      }
      @case ('user') {
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      }
      @case ('briefcase') {
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
      }
      @case ('calendar') {
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      }
      @case ('medical') {
        <path d="M7 3v5a5 5 0 0 0 10 0V3M5 3h4M15 3h4M12 13v2a5 5 0 0 0 10 0v-2" />
        <circle cx="20" cy="11" r="2" />
      }
      @case ('chart') {
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 17v-4M12 17V7M16 17v-7" />
      }
      @case ('settings') {
        <circle cx="12" cy="12" r="3" />
        <path
          d="M19.4 15a1.8 1.8 0 0 0 .36 2l.06.06-2.83 2.83-.06-.06a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.1 1.65V21h-4v-.09a1.8 1.8 0 0 0-1.1-1.65 1.8 1.8 0 0 0-2 .36l-.06.06-2.83-2.83.06-.06a1.8 1.8 0 0 0 .36-2A1.8 1.8 0 0 0 2.6 13.7H2v-4h.09A1.8 1.8 0 0 0 3.74 8.6a1.8 1.8 0 0 0-.36-2l-.06-.06 2.83-2.83.06.06a1.8 1.8 0 0 0 2 .36A1.8 1.8 0 0 0 9.3 2.5V2h4v.09a1.8 1.8 0 0 0 1.1 1.65 1.8 1.8 0 0 0 2-.36l.06-.06 2.83 2.83-.06.06a1.8 1.8 0 0 0-.36 2 1.8 1.8 0 0 0 1.65 1.1H21v4h-.09A1.8 1.8 0 0 0 19.4 15Z"
        />
      }
      @case ('search') {
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      }
      @case ('bell') {
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      }
      @case ('menu') {
        <path d="M4 6h16M4 12h16M4 18h16" />
      }
      @case ('close') {
        <path d="m6 6 12 12M18 6 6 18" />
      }
      @case ('check') {
        <path d="m5 12 4 4L19 6" />
      }
      @case ('arrow') {
        <path d="m9 18 6-6-6-6" />
      }
      @case ('back') {
        <path d="m15 18-6-6 6-6" />
      }
      @case ('help') {
        <circle cx="12" cy="12" r="10" />
        <path d="M9.2 9a3 3 0 1 1 5 2.2c-1.5 1-2.2 1.5-2.2 3M12 18h.01" />
      }
      @case ('eye') {
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      }
      @case ('eye-off') {
        <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a14.6 14.6 0 0 1-3 3.8M6.2 6.2C3.6 8 2 12 2 12s3.6 7 10 7a10.7 10.7 0 0 0 4.1-.8" />
      }
      @case ('chat') {
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        <path d="M8 10h.01M12 10h.01M16 10h.01" />
      }
      @case ('logout') {
        <path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6" />
      }
      @case ('clock') {
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      }
      @case ('pin') {
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2" />
      }
      @case ('file') {
        <path d="M6 2h8l4 4v16H6zM14 2v5h5M9 13h6M9 17h6" />
      }
      @case ('plus') {
        <path d="M12 5v14M5 12h14" />
      }
      @case ('cross') {
        <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z" />
        <path d="M12 7v10M7 12h10" />
      }
      @default {
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 17h.01" />
      }
    }
  </svg>`,
})
export class Icon {
    name = input('grid');
    size = input(20);
}
