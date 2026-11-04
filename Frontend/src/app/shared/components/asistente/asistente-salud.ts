import { ConfiguracionAsistente } from './asistente-administrador';

export const ASISTENTE_SALUD: ConfiguracionAsistente = {
  titulo: 'Palma · Asistente de Salud Ocupacional',
  subtitulo: 'En línea',
  bienvenida: (nombre) =>
    `${nombre ? `Hola, ${nombre}.` : 'Hola.'} Puedo ayudarte con solicitudes, programación, agenda y resultados de aptitud.`,
  sugerencias: ['Solicitudes pendientes', 'Agenda de exámenes', 'Registrar aptitud'],
  nota: 'Respuestas simuladas para esta demostración',
};

export function responderSalud(pregunta: string): string {
  const texto = pregunta
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (texto.includes('solicitud') || texto.includes('pendiente')) {
    return (
      'Las solicitudes enviadas por RR. HH. aparecen en Solicitudes recibidas. ' +
      'Desde allí puedes programar sede, fecha, hora y tipo de examen.'
    );
  }

  if (texto.includes('program') || texto.includes('agenda') || texto.includes('cupo') || texto.includes('sede')) {
    return (
      'En Agenda de exámenes ves los cupos disponibles por sede y las ' +
      'evaluaciones programadas de cada día. Los horarios ocupados no se ofrecen al programar.'
    );
  }

  if (texto.includes('aptitud') || texto.includes('resultado') || texto.includes('conclusion')) {
    return (
      'En Resultados de aptitud presiona Registrar, elige la conclusión (Apto, ' +
      'Apto con restricciones o No apto) y confirma. RR. HH. solo verá la conclusión autorizada.'
    );
  }

  if (texto.includes('clinic') || texto.includes('diagnostic') || texto.includes('historia')) {
    return (
      'Este portal no almacena diagnósticos ni historias clínicas. ' +
      'Solo se registra la conclusión de aptitud y una observación administrativa.'
    );
  }

  if (texto.includes('cuenta') || texto.includes('perfil') || texto.includes('configur')) {
    return (
      'Abre el menú de tu avatar para entrar a Mi cuenta o Configuración y ' +
      'actualizar tus datos o la apariencia del portal.'
    );
  }

  return (
    'Puedo orientarte sobre solicitudes, programación, agenda y conclusiones ' +
    'de aptitud ocupacional.'
  );
}
