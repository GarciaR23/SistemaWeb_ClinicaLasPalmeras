import { Component } from '@angular/core';
import { Icon } from '../../../../shared/components/icono/icono';

@Component({
  selector: 'app-help-page',
  styleUrl: './ayuda.scss',
  imports: [Icon],
  template: `<div class="help-page">
    <header class="help-hero">
      <span class="help-hero-icon"><app-icon name="help" [size]="30" /></span>
      <div>
        <span class="eyebrow">CENTRO DE AYUDA · RECURSOS HUMANOS</span>
        <h1>¿Cómo podemos ayudarte?</h1>
        <p>Encuentra respuestas rápidas para usar el portal de RR. HH.</p>
      </div>
    </header>

    <section class="help-section" aria-labelledby="faq-title">
      <div class="section-heading">
        <div>
          <h2 id="faq-title">Preguntas frecuentes</h2>
          <p>Respuestas sobre las tareas más comunes del área.</p>
        </div>
        <span class="question-count">{{ questions.length }} temas</span>
      </div>
      @for (item of questions; track item[0]) {
        <details class="faq-item">
          <summary>{{ item[0] }}</summary>
          <p>{{ item[1] }}</p>
        </details>
      }
    </section>
  </div>`,
})
export class HelpPage {
  questions = [
    [
      '¿Cómo creo una vacante?',
      'Abre Vacantes, selecciona Nueva vacante y completa el puesto, área, sede y requisitos.',
    ],
    [
      '¿Cómo programo una entrevista?',
      'Con el perfil de Recursos Humanos, abre un postulante, preselecciónalo y selecciona Programar entrevista.',
    ],
    [
      '¿Cómo se registra la evaluación médica?',
      'RR. HH. solicita la evaluación desde el perfil del candidato. Salud Ocupacional programa el examen y registra la conclusión de aptitud.',
    ],
    [
      '¿Dónde veo el avance de un candidato?',
      'Abre Postulantes y selecciona Ver perfil para consultar su etapa y las evaluaciones registradas.',
    ],
    [
      '¿Cómo consulto los resultados de selección?',
      'Abre Resultados para consultar candidatos evaluados, contratados o rechazados y exportar el listado CSV.',
    ],
    [
      '¿Qué significa demostración local?',
      'Permite revisar el frontend con datos de prueba en este navegador. La autenticación y los permisos reales se validarán al conectar el backend.',
    ],
  ];
}
