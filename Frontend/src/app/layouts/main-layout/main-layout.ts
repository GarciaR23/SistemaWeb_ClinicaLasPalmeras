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

import { Session, ROLE_LABELS } from '../../core/services/sesion';
import { ROLE_HOME, UserRole } from '../../core/services/modelos-sesion';
import { PreferencesService } from '../../features/recursos-humanos/services/servicio-preferencias';
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
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class LayoutPrincipal implements OnInit {
  readonly session = inject(Session);
  readonly preferences = inject(PreferencesService);

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
    }, 3200);
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