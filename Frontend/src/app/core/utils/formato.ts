const ZONA_HORARIA = 'America/Lima';

function diaLima(fecha: Date): string {
  return fecha.toLocaleDateString('en-CA', { timeZone: ZONA_HORARIA });
}

/**
 * Convierte una marca de tiempo (ISO o milisegundos) en un texto corto:
 * "Hoy · 09:20", "Ayer · 17:20" o "18/08/2026 · 16:40".
 * Devuelve null cuando el valor no es una fecha válida.
 */
export function formatearFechaHora(valor: string | number | null | undefined): string | null {
  if (valor === null || valor === undefined || valor === '' || valor === '—') return null;

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) return null;

  const hora = fecha.toLocaleTimeString('es-PE', {
    timeZone: ZONA_HORARIA,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const ahora = new Date();
  const ayer = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);

  if (diaLima(fecha) === diaLima(ahora)) return `Hoy · ${hora}`;
  if (diaLima(fecha) === diaLima(ayer)) return `Ayer · ${hora}`;

  const dia = fecha.toLocaleDateString('es-PE', {
    timeZone: ZONA_HORARIA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return `${dia} · ${hora}`;
}

export function iniciales(nombre: string): string {
  return nombre
    .replace(/^(dr|dra)\.?\s+/i, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();
}
