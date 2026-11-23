import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  inject,
  viewChild,
} from '@angular/core';

import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { DatePipe } from '@angular/common';

import { Session, ROLE_LABELS } from '../../core/services/sesion';
import { ROLE_HOME, UserRole } from '../../core/services/modelos-sesion';
import { PreferencesService } from '../../features/recursos-humanos/services/servicio-preferencias';
import { ServicioNotificaciones } from '../../features/postulante/services/servicio-notificaciones';
import { Icon } from '../../shared/components/icono/icono';
import { iniciales, primerNombre } from '../../core/utils/formato';
import { Asistente } from '../../shared/components/asistente/asistente';
import { ROLE_NAV } from './navegacion';

@Component({
  selector: 'app-layout-principal',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    Icon,
    Asistente,
    DatePipe,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class LayoutPrincipal implements OnInit {
  readonly session = inject(Session);
  readonly preferences = inject(PreferencesService);
  readonly notificacionesService = inject(ServicioNotificaciones);

  private readonly router = inject(Router);

  readonly labels = ROLE_LABELS;
  readonly nav = ROLE_NAV;

  readonly profileButton =
    viewChild<ElementRef<HTMLButtonElement>>('profileButton');

  readonly notificationsButton =
    viewChild<ElementRef<HTMLButtonElement>>('notificationsButton');

  readonly menuButton =
    viewChild<ElementRef<HTMLButtonElement>>('menuButton');

  sidebarOpen = false;
  profileOpen = false;
  notificationsOpen = false;
  bienvenidaVisible = false;
  bienvenidaTexto = '';

  /** Perfiles que cuentan con cuenta, configuración, notificaciones y asistente. */
  private readonly perfilesConHerramientas: UserRole[] = ['rrhh', 'admin', 'health', 'applicant'];

  get isRrhh(): boolean {
    return this.session.role() === 'rrhh';
  }

  get hasPortalTools(): boolean {
    const role = this.session.role();

    return !!role && this.perfilesConHerramientas.includes(role);
  }

  /** Ruta base del perfil, usada por Mi cuenta y Configuración. */
  get accountBase(): string {
    const role = this.session.role();

    return role ? ROLE_HOME[role] : '';
  }

  get assistantProfile(): 'rrhh' | 'admin' | 'salud' | 'postulante' {
    const role = this.session.role();

    if (role === 'admin') return 'admin';
    if (role === 'applicant') return 'postulante';

    return role === 'health' ? 'salud' : 'rrhh';
  }

  get items() {
    const role = this.session.role();

    return role ? this.nav[role] : [];
  }

  get roleLabel(): string {
    const role = this.session.role();

    return role ? this.labels[role] : '';
  }

  get initials(): string {
    return iniciales(this.session.user()?.name ?? '');
  }

  get bienvenidaImagen(): string {
    const fotos: Record<UserRole, string> = {
      rrhh: 'https://images.unsplash.com/photo-1758873268745-dd2cf0d677b5?auto=format&fit=crop&w=1000&q=80',
      admin: 'https://images.unsplash.com/photo-1778151270886-f227700b0eba?auto=format&fit=crop&w=1000&q=80',
      health: 'https://images.unsplash.com/photo-1758691462370-cef1774278cd?auto=format&fit=crop&w=1000&q=80',
      applicant: 'https://images.unsplash.com/photo-1758691462651-611d730c5272?auto=format&fit=crop&w=1000&q=80',
    };
    const role = this.session.role();
    return role ? fotos[role] : fotos.applicant;
  }

  async ngOnInit(): Promise<void> {
    if (!this.hasPortalTools) return;

    if (sessionStorage.getItem('mostrar-bienvenida') === 'true') {
      sessionStorage.removeItem('mostrar-bienvenida');
      this.mostrarBienvenida();
    }

    try {
      await this.preferences.load();
    } catch {
      // Se conservan las preferencias predeterminadas.
    }
  }

  private mostrarBienvenida(): void {
    const nombre = primerNombre(this.session.user()?.name ?? '');
    const rol = this.roleLabel;
    this.bienvenidaTexto = nombre
      ? `Bienvenido, ${nombre}. Has ingresado como ${rol}.`
      : `Bienvenido al portal de ${rol}.`;
    this.bienvenidaVisible = true;

    window.setTimeout(() => {
      this.bienvenidaVisible = false;
    }, 2500);
  }

  openSidebar(): void {
    this.closePanels();
    this.sidebarOpen = true;
  }

  closeSidebar(restoreFocus = false): void {
    this.sidebarOpen = false;

    if (restoreFocus) {
      this.menuButton()?.nativeElement.focus();
    }
  }

  toggleProfile(): void {
    this.notificationsOpen = false;
    this.profileOpen = !this.profileOpen;
  }

  toggleNotifications(): void {
    this.profileOpen = false;
    this.notificationsOpen = !this.notificationsOpen;
  }

  onNotificationClick(notif: { id: number }): void {
    this.notificacionesService.marcarLeida(notif.id);
    this.closePanels();
    void this.router.navigateByUrl('/postulante/notificaciones');
  }

  closePanels(): void {
    this.profileOpen = false;
    this.notificationsOpen = false;
  }

  logout(): void {
    this.closePanels();
    this.sidebarOpen = false;
    this.session.logout();

    void this.router.navigateByUrl('/iniciar-sesion');
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.profileOpen) {
      this.profileOpen = false;
      this.profileButton()?.nativeElement.focus();
      return;
    }

    if (this.notificationsOpen) {
      this.notificationsOpen = false;
      this.notificationsButton()?.nativeElement.focus();
      return;
    }

    if (this.sidebarOpen) {
      this.closeSidebar(true);
    }
  }
}