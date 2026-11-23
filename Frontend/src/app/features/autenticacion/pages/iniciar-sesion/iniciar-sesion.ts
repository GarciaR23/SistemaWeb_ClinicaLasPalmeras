import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { Feedback } from '../../../../core/services/feedback';
import { Icon } from '../../../../shared/components/icono/icono';
import { ServicioAutenticacion } from '../../services/servicio-autenticacion';

type Pantalla = 'login' | 'recuperar' | 'registro';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface RippleItem {
  id: number;
  x: number;
  y: number;
  size: number;
}

@Component({
  selector: 'app-iniciar-sesion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Icon],
  templateUrl: './iniciar-sesion.html',
  styleUrl: './iniciar-sesion.scss',
})
export class IniciarSesion implements AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas')
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly auth = inject(ServicioAutenticacion);
  private readonly router = inject(Router);
  private readonly feedback = inject(Feedback);

  readonly loginForm = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s]+$/),
      ],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(1),
        Validators.pattern(/^[^\s]+$/),
      ],
    }),
  });

  pantalla: Pantalla = 'login';
  nameFocused = false;
  emailFocused = false;
  passwordFocused = false;
  mostrarContrasena = false;

  error = '';
  mensaje = '';
  busy = false;
  submitted = false;
  slideDirection: 'next' | 'back' | '' = '';
  ripples: RippleItem[] = [];
  recoveryModalOpen = false;
  registerModalState: 'idle' | 'loading' | 'success' = 'idle';

  private slideTimer?: number;
  private rippleCounter = 0;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationFrameId = 0;
  private width = 0;
  private height = 0;
  private readonly pointer = { x: -9999, y: -9999, active: false };

  private readonly onMouseMove = (event: MouseEvent): void => {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    this.pointer.x = event.clientX - rect.left;
    this.pointer.y = event.clientY - rect.top;
    this.pointer.active = true;
  };

  private readonly onMouseLeave = (): void => {
    this.pointer.active = false;
    this.pointer.x = -9999;
    this.pointer.y = -9999;
  };

  private readonly onResize = (): void => {
    this.resizeCanvas();
  };

  get nameControl(): FormControl<string> {
    return this.loginForm.controls.name;
  }

  get emailControl(): FormControl<string> {
    return this.loginForm.controls.email;
  }

  get passwordControl(): FormControl<string> {
    return this.loginForm.controls.password;
  }

  get seguridadContrasena(): {
    nivel: string;
    clase: string;
    puntaje: number;
  } | null {
    const pwd = this.passwordControl.value;
    if (this.pantalla !== 'registro' || !pwd) {
      return null;
    }

    const puntaje = [
      pwd.length >= 8,
      /[a-z]/.test(pwd),
      /[A-Z]/.test(pwd),
      /\d/.test(pwd),
      /[^A-Za-z0-9]/.test(pwd),
    ].filter(Boolean).length;

    if (puntaje <= 2) {
      return { nivel: 'Débil', clase: 'strength-weak', puntaje };
    }
    if (puntaje <= 4) {
      return { nivel: 'Media', clase: 'strength-medium', puntaje };
    }
    return { nivel: 'Fuerte', clase: 'strength-strong', puntaje };
  }

  get titulo(): string {
    switch (this.pantalla) {
      case 'registro':
        return 'Crear cuenta';
      case 'recuperar':
        return 'Recuperar contraseña';
      default:
        return 'Iniciar sesión';
    }
  }

  get descripcion(): string {
    switch (this.pantalla) {
      case 'registro':
        return 'Regístrate para acceder al portal de selección.';
      case 'recuperar':
        return 'Ingresa el correo asociado a tu cuenta.';
      default:
        return 'Ingresa tus credenciales institucionales para continuar.';
    }
  }

  get textoBoton(): string {
    if (this.busy) {
      return 'Verificando...';
    }
    switch (this.pantalla) {
      case 'registro':
        return 'Crear cuenta';
      case 'recuperar':
        return 'Enviar enlace';
      default:
        return 'Ingresar al sistema';
    }
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    this.resizeCanvas();
    this.initParticles();

    canvas.addEventListener('mousemove', this.onMouseMove);
    canvas.addEventListener('mouseleave', this.onMouseLeave);
    window.addEventListener('resize', this.onResize);

    this.animateParticles();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    window.clearTimeout(this.slideTimer);
    const canvas = this.canvasRef?.nativeElement;
    if (canvas) {
      canvas.removeEventListener('mousemove', this.onMouseMove);
      canvas.removeEventListener('mouseleave', this.onMouseLeave);
    }
    window.removeEventListener('resize', this.onResize);
  }

  cambiarPantalla(pantalla: Pantalla): void {
    if (this.busy) return;

    const direction = pantalla === 'login' ? 'back' : 'next';
    this.slideDirection = '';
    window.clearTimeout(this.slideTimer);
    window.setTimeout(() => {
      this.slideDirection = direction;
      this.slideTimer = window.setTimeout(() => {
        this.slideDirection = '';
      }, 380);
    });

    this.pantalla = pantalla;
    this.submitted = false;
    this.mostrarContrasena = false;
    this.error = '';
    this.mensaje = '';
    this.loginForm.reset({ name: '', email: '', password: '' });

    if (pantalla === 'registro') {
      this.nameControl.setValidators([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(120),
        Validators.pattern(
          /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+([ '-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/,
        ),
      ]);
      this.passwordControl.setValidators([
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^[^\s]+$/),
      ]);
    } else if (pantalla === 'recuperar') {
      this.nameControl.clearValidators();
      this.passwordControl.clearValidators();
    } else {
      this.nameControl.clearValidators();
      this.passwordControl.setValidators([
        Validators.required,
        Validators.minLength(1),
        Validators.pattern(/^[^\s]+$/),
      ]);
    }

    this.nameControl.updateValueAndValidity();
    this.passwordControl.updateValueAndValidity();
  }

  togglePasswordVisibility(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  bloquearEspacio(event: KeyboardEvent): void {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  triggerRipple(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement | null;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    const id = ++this.rippleCounter;

    this.ripples = [...this.ripples, { id, x, y, size }];

    window.setTimeout(() => {
      this.ripples = this.ripples.filter((r) => r.id !== id);
    }, 560);
  }

  async submit(): Promise<void> {
    if (this.busy) return;

    this.submitted = true;
    this.error = '';
    this.mensaje = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.pantalla === 'recuperar') {
      this.mensaje =
        'Si el correo ingresado corresponde a una cuenta registrada en Clínica Las Palmeras, recibirás las instrucciones para restablecer tu contraseña.';
      this.recoveryModalOpen = true;
      this.playSuccessSound();
      return;
    }

    const { name, email, password } = this.loginForm.getRawValue();
    this.busy = true;

    if (this.pantalla === 'registro') {
      this.registerModalState = 'loading';
    }

    try {
      const destino =
        this.pantalla === 'registro'
          ? await this.auth.registrar(name.trim(), email.trim(), password)
          : await this.auth.ingresar(email.trim(), password);

      if (this.pantalla === 'registro') {
        await new Promise((resolve) => window.setTimeout(resolve, 750));
        this.registerModalState = 'success';
        this.playSuccessSound();
        await new Promise((resolve) => window.setTimeout(resolve, 1300));
        this.registerModalState = 'idle';
      }

      sessionStorage.setItem('mostrar-bienvenida', 'true');
      await this.router.navigateByUrl(destino);
    } catch (error) {
      this.registerModalState = 'idle';
      this.error =
        error instanceof Error
          ? error.message
          : 'No se pudo completar la operación.';
      this.feedback.show('error', 'No pudimos ingresar', this.error);
    } finally {
      this.busy = false;
    }
  }

  closeRecoveryModal(): void {
    this.recoveryModalOpen = false;
  }

  private playSuccessSound(): void {
    try {
      const ctx = new AudioContext();
      const notes = [587.33, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = ctx.currentTime + idx * 0.11;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.28, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
      });
      window.setTimeout(() => void ctx.close(), 800);
    } catch {
      // Omitido si el navegador bloquea AudioContext.
    }
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.ctx) return;

    const parent = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    this.width = parent ? parent.clientWidth : window.innerWidth / 2;
    this.height = parent ? parent.clientHeight : window.innerHeight;

    canvas.width = Math.floor(this.width * dpr);
    canvas.height = Math.floor(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private initParticles(): void {
    const count = 86;
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.65,
      vy: (Math.random() - 0.5) * 0.65,
      radius: 1.4 + Math.random() * 1.7,
    }));
  }

  private animateParticles = (): void => {
    if (!this.ctx) return;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.width, this.height);

    const maxLinkDist = 155;
    const repelRadius = 150;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      if (this.pointer.active) {
        const dx = p.x - this.pointer.x;
        const dy = p.y - this.pointer.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 0 && dist < repelRadius) {
          const force = (repelRadius - dist) / repelRadius;
          p.vx += (dx / dist) * force * 0.65;
          p.vy += (dy / dist) * force * 0.65;
        }
      }

      p.vx *= 0.985;
      p.vy *= 0.985;

      if (Math.hypot(p.vx, p.vy) < 0.15) {
        p.vx += (Math.random() - 0.5) * 0.08;
        p.vy += (Math.random() - 0.5) * 0.08;
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x <= 0 || p.x >= this.width) p.vx *= -1;
      if (p.y <= 0 || p.y >= this.height) p.vy *= -1;
      p.x = Math.max(0, Math.min(this.width, p.x));
      p.y = Math.max(0, Math.min(this.height, p.y));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 229, 160, 0.7)';
      ctx.fill();

      for (let j = i + 1; j < this.particles.length; j++) {
        const q = this.particles[j];
        const dist = Math.hypot(p.x - q.x, p.y - q.y);

        if (dist < maxLinkDist) {
          const alpha = 1 - dist / maxLinkDist;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0, 229, 160, ${(alpha * 0.45).toFixed(3)})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(this.animateParticles);
  };
}
