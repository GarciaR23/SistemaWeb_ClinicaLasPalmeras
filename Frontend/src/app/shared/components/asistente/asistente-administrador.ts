export interface ConfiguracionAsistente {
  titulo: string;
  subtitulo: string;
  bienvenida: string;
  sugerencias: string[];
  nota?: string;
}

export const ASISTENTE_ADMINISTRADOR: ConfiguracionAsistente = {
  titulo: 'Palma · Asistente de administración',
  subtitulo: 'En línea',
  bienvenida:
    'Hola. Puedo ayudarte con usuarios, permisos, auditoría y configuración de la plataforma.',
  sugerencias: ['Usuarios inactivos', 'Auditoría reciente', 'Configurar permisos'],
  nota: 'Respuestas simuladas para esta demostración',
};

export function responderAdministrador(pregunta: string): string {
  const texto = pregunta
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (texto.includes('inactiv') || texto.includes('desactiv')) {
    return (
      'Abre Gestión de usuarios y usa el botón Desactivar o Activar de cada fila. ' +
      'Una cuenta inactiva no puede iniciar sesión. ' +
      'No es posible desactivar tu propia cuenta.'
    );
  }

  if (texto.includes('permiso') || texto.includes('rol')) {
    return (
      'El rol se asigna al crear la cuenta en Gestión de usuarios y define ' +
      'las secciones disponibles. La edición detallada de permisos por rol ' +
      'se habilitará cuando se conecte el servicio.'
    );
  }

  if (texto.includes('crear') || texto.includes('usuario') || texto.includes('cuenta')) {
    return (
      'Abre Gestión de usuarios, presiona Crear usuario e ingresa el nombre ' +
      'completo y el rol autorizado. Podrás filtrar la lista por nombre, correo o rol.'
    );
  }

  if (texto.includes('auditor') || texto.includes('actividad') || texto.includes('registro')) {
    return (
      'En Auditoría verás quién realizó cada acción, cuándo y en qué módulo. ' +
      'Este registro no muestra diagnósticos ni información clínica detallada.'
    );
  }

  if (texto.includes('configur') || texto.includes('tema') || texto.includes('apariencia')) {
    return (
      'Abre el menú de tu avatar y selecciona Configuración para cambiar la ' +
      'apariencia, las notificaciones y los datos de la institución.'
    );
  }

  return (
    'Puedo orientarte sobre usuarios, roles, auditoría y configuración. ' +
    'Indícame sobre cuál de esas opciones necesitas ayuda.'
  );
}
