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
import { PreferencesService } from '../../features/recursos-humanos/services/servicio-preferencias';
import { Icon } from '../../shared/components/icono/icono';
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

  get isRrhh(): boolean {
    return this.session.role() === 'rrhh';
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
    return (
      this.session
        .user()
        ?.name.trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || ''
    );
  }

  async ngOnInit(): Promise<void> {
    if (!this.isRrhh) return;

    try {
      await this.preferences.load();
    } catch {
      // Se conservan las preferencias predeterminadas.
    }
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