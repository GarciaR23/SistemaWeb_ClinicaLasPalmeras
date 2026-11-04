import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Session } from '../../../core/services/sesion';
import { primerNombre } from '../../../core/utils/formato';
import { Icon } from '../icono/icono';
import {
  ASISTENTE_ADMINISTRADOR,
  ConfiguracionAsistente,
  responderAdministrador,
} from './asistente-administrador';
import { ASISTENTE_SALUD, responderSalud } from './asistente-salud';


interface Mensaje {
  id: number;
  autor: 'asistente' | 'usuario';
  texto: string;
}

@Component({
  selector: 'app-asistente',
  standalone: true,
  imports: [FormsModule, Icon],
  templateUrl: './asistente.html',
  styleUrl: './asistente.scss',
})
export class Asistente implements OnInit {
  private readonly session = inject(Session);

  readonly perfil = input<'rrhh' | 'admin' | 'salud'>('rrhh');
  readonly botonAbrir =
    viewChild<ElementRef<HTMLButtonElement>>('botonAbrir');

  readonly campoConsulta =
    viewChild<ElementRef<HTMLInputElement>>('campoConsulta');

  readonly historial =
    viewChild<ElementRef<HTMLDivElement>>('historial');

  abierto = false;
  consulta = '';

  private readonly configuracionRrhh: ConfiguracionAsistente = {
    titulo: 'Asistente Las Palmeras',
    subtitulo: 'Ayuda del portal',
    bienvenida: () =>
      'Hola. Soy el asistente del portal. ' +
      'Puedo orientarte sobre postulantes, vacantes, ' +
      'entrevistas y resultados.',
    sugerencias: [
      '¿Cómo registro un postulante?',
      '¿Cómo programo una entrevista?',
      '¿Cómo solicito un examen médico?',
    ],
  };

  readonly configuracion = computed(() => {
    switch (this.perfil()) {
      case 'admin':
        return ASISTENTE_ADMINISTRADOR;
      case 'salud':
        return ASISTENTE_SALUD;
      default:
        return this.configuracionRrhh;
    }
  });

  mensajes: Mensaje[] = [];

  ngOnInit(): void {
    this.mensajes = [
      { id: 1, autor: 'asistente', texto: this.configuracion().bienvenida(
          primerNombre(this.session.user()?.name ?? ''),
        ),
      },
    ];
  }

  private siguienteId = 2;

  alternar(): void {
    if (this.abierto) {
      this.cerrar();
      return;
    }

    this.abierto = true;

    // Espera a que Angular muestre el panel.
    setTimeout(() => {
      if (!this.abierto) return;

      this.campoConsulta()?.nativeElement.focus();
      this.desplazarHistorial();
    });
  }

  cerrar(): void {
    this.abierto = false;
    this.botonAbrir()?.nativeElement.focus();
  }

  enviar(texto = this.consulta): void {
    const pregunta = texto.trim().slice(0, 500);

    if (!pregunta) return;

    this.mensajes.push({
      id: this.siguienteId++,
      autor: 'usuario',
      texto: pregunta,
    });

    this.mensajes.push({
      id: this.siguienteId++,
      autor: 'asistente',
      texto: this.obtenerRespuesta(pregunta),
    });

    this.consulta = '';

    setTimeout(() => {
      if (!this.abierto) return;

      this.desplazarHistorial();
      this.campoConsulta()?.nativeElement.focus();
    });
  }

  @HostListener('document:keydown.escape')
  cerrarConEscape(): void {
    if (this.abierto) {
      this.cerrar();
    }
  }

  private desplazarHistorial(): void {
    const elemento = this.historial()?.nativeElement;

    if (elemento) {
      elemento.scrollTop = elemento.scrollHeight;
    }
  }

  private obtenerRespuesta(pregunta: string): string {
    if (this.perfil() === 'admin') return responderAdministrador(pregunta);
    if (this.perfil() === 'salud') return responderSalud(pregunta);

    const texto = pregunta
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (texto.includes('vacant')) {
      return (
        'Abre Vacantes y selecciona Nueva vacante. ' +
        'Completa el puesto, área, sede, modalidad y requisitos. ' +
        'Después presiona Publicar vacante.'
      );
    }

    if (texto.includes('entrevist')) {
      return (
        'Abre Postulantes y entra en Ver perfil. ' +
        'Si el candidato está preseleccionado, selecciona ' +
        'Programar entrevista y completa fecha, hora y lugar. ' +
        'Puedes consultar la cita en Entrevistas.'
      );
    }

    if (
      texto.includes('medic') ||
      texto.includes('salud') ||
      texto.includes('aptitud')
    ) {
      return (
        'Desde el perfil del candidato, en la etapa de entrevista, ' +
        'selecciona Solicitar evaluación ocupacional. ' +
        'Salud Ocupacional se encargará de la cita y la aptitud. ' +
        'RR. HH. podrá consultar la información en Exámenes médicos.'
      );
    }

    if (
      texto.includes('resultado') ||
      texto.includes('contrat')
    ) {
      return (
        'Abre Resultados para consultar candidatos evaluados, ' +
        'contratados o rechazados. Desde el perfil de un candidato ' +
        'evaluado puedes realizar la revisión final.'
      );
    }

    if (
      texto.includes('postulante') ||
      texto.includes('candidato')
    ) {
      return (
        'Abre Postulantes y selecciona Nuevo postulante. ' +
        'Completa sus datos y elige una vacante. ' +
        'También puedes buscar un candidato y abrir Ver perfil ' +
        'para revisar su proceso.'
      );
    }

    if (
      texto.includes('cuenta') ||
      texto.includes('perfil')
    ) {
      return (
        'Presiona tu avatar en el encabezado y selecciona ' +
        'Mi cuenta para revisar o actualizar tus datos.'
      );
    }

    if (
      texto.includes('tema') ||
      texto.includes('configur') ||
      texto.includes('apariencia')
    ) {
      return (
        'Abre el menú de tu avatar y selecciona Configuración. ' +
        'Allí puedes modificar las preferencias de apariencia.'
      );
    }

    return (
      'Puedo orientarte sobre postulantes, vacantes, entrevistas, ' +
      'exámenes médicos, resultados y tu cuenta. ' +
      'Indícame sobre cuál de esas opciones necesitas ayuda.'
    );
  }
}