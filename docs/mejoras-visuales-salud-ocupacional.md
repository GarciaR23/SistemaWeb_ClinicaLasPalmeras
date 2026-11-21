# Mejoras visuales – perfil Salud Ocupacional

Rama: `feature/mejoras-visuales-salud-ocupacional`
Alcance: `Frontend/src/app/features/salud-ocupacional` y `Frontend/public/images/salud-ocupacional`.
No se modificaron archivos compartidos (`shared/`, `styles.scss`) ni otros perfiles.

## Coherencia con Postulante y Administrador

Usa los mismos valores que `features/postulante/pages/_estilos.scss` (copiados en `salud-ocupacional/_estilos.scss`): tarjeta de 16 px con borde y sombra suaves, elevación de 2 px (3 px en indicadores) al pasar el cursor, transiciones de 180 ms, `scale(0.98)` al presionar, entrada de pantalla de 350 ms, mismos botones, banner, lista con flecha y etiquetas de estado.
Se agregó el tono **ámbar** para el estado «Pendiente», que Postulante no tenía.
Las duraciones de Postulante (350 ms / 180 ms) difieren de la tabla recomendada (250 ms / 150 ms); se usaron las de Postulante y se cambian en `_estilos.scss` (`$entrada-pagina`, `$transicion`).

## Qué cambió, por qué mejora y qué pantallas afecta

| Pantalla | Qué cambió | Por qué mejora |
|---|---|---|
| Dashboard · banner | Mensaje «Bienvenido, Dr. Paredes. Coordina solicitudes, agenda evaluaciones y registra resultados de aptitud en un solo lugar.», botón «Revisar solicitudes» e imagen | Reconocimiento del usuario y acceso directo a su tarea principal |
| Dashboard · tarjetas | Indicadores con icono de color, elevación al pasar el cursor y «Trabajo pendiente» como lista con flecha y estado vacío | Mayor jerarquía visual |
| Solicitudes recibidas | Tarjetas con iniciales, nombre, puesto, tipo de evaluación, fecha y estado de color; acciones «Programar» y «Ver detalle»; contadores por estado que filtran; búsqueda; estado vacío ilustrado; aviso de información clínica restringida | La coordinadora ve el estado de cada solicitud de un vistazo |
| Solicitudes · datos de ejemplo | Si RR. HH. no ha enviado solicitudes (y solo en modo demostración) se muestran 4 ejemplos marcados como «Demostración», con «Programar» deshabilitado | Permite validar el diseño sin crear datos falsos reales |
| Agenda de exámenes | Las tarjetas de sede abren una ventana con cupos, horarios libres y evaluaciones del día; el día vacío muestra ilustración, cupos por sede y las acciones «Programar evaluación» y «Ver próxima fecha con evaluaciones» | Acción sugerida en lugar de un mensaje vacío |
| Resultados de aptitud | Tarjetas de perfil con iniciales, nombre, puesto, fecha, sede, conclusión de color (Pendiente, Apto, Apto con restricciones, No apto) y botón «Registrar» | Se identifica rápido quién falta por registrar |

## Notas

- El módulo de Recursos Humanos de este repositorio no tiene una ventana de detalle de sedes; se creó con la ventana compartida (`app-modal`). Si más adelante RR. HH. agrega la suya, conviene unificarlas.
- No se agregó el mapa de ubicación porque las sedes no tienen dirección registrada.
- La lógica de programación, registro de aptitud y datos sigue igual; solo se agregaron estados de presentación (`SolicitudVista`, `EstadoSolicitud`).

## Imágenes

| Archivo | Uso | Formato |
|---|---|---|
| `images/salud-ocupacional/banner-salud.jpg` (**tu foto, opcional**) | Banner del dashboard | JPG, proporción 8:5 (p. ej. 1120 × 700 px), menos de 300 KB. Evaluación ocupacional: personal de salud evaluando a un trabajador |
| `images/salud-ocupacional/evaluacion-ocupacional.svg` | Banner si no hay foto | Incluido |
| `images/salud-ocupacional/sin-solicitudes.svg` | Estado vacío de solicitudes | Incluido |
| `images/salud-ocupacional/agenda-vacia.svg` | Día sin evaluaciones | Incluido |

## Accesibilidad

- Las animaciones se desactivan con `prefers-reduced-motion`.
- En alto contraste las etiquetas y avatares usan bordes blancos.
- Se conservan `aria-label`, `role` y los textos para lectores de pantalla.

## Pendiente

- Actualizar el prototipo en Figma con estas pantallas.
