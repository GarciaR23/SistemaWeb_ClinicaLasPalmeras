# Mejoras visuales – perfil Administrador

Rama: `feature/mejoras-visuales-administrador`
Alcance: `Frontend/src/app/features/administrador` y `Frontend/public/images/administrador`.
No se modificaron archivos compartidos (`shared/`, `styles.scss`) ni otros perfiles.

## Coherencia con el módulo de Postulante

Administrador usa los mismos valores que `features/postulante/pages/_estilos.scss` (copiados en `administrador/_estilos.scss`), para que todo el sistema se vea y se sienta igual:

| Elemento | Valor compartido |
|---|---|
| Tarjeta | radio 16 px, borde `#e8eef5`, sombra `0 2px 10px` |
| Hover de tarjeta | sube 2 px (3 px en indicadores), sombra `0 10px 26px`, borde `#cbdbe8` |
| Transiciones | 180 ms (220 ms en indicadores y botón del banner) |
| Al presionar | `scale(0.98)` en botones y enlaces |
| Entrada de pantalla | 350 ms, `cubic-bezier(0.16, 1, 0.3, 1)`, sube 10 px |
| Botones | alto 40 px, radio 8 px, mismo hover y botón primario `#0c2340` |
| Banner | mismo degradado, medidas (marco 280 × 175), botón y zoom de imagen al pasar el cursor |
| Lista con flecha | fila resaltada `rgb(234 243 251 / 60%)` y flecha que se desplaza 4 px |
| Etiquetas de estado | píldora con borde, 11.5 px, colores azul, celeste, verde, violeta, rojo y gris |

Nota: la tabla de duraciones recomendada (250 ms página, 150 ms botones) difiere de lo que ya usa Postulante (350 ms y 180 ms). Se usaron los valores de Postulante para que ambos módulos se sientan igual; se cambian en `_estilos.scss` (`$entrada-pagina`, `$transicion`).

## Qué cambió, por qué mejora y qué pantallas afecta

| Pantalla | Qué cambió | Por qué mejora |
|---|---|---|
| Dashboard · banner | Bienvenida con el nombre de la sesión, botón «Gestionar accesos» e imagen | Reconocimiento del usuario y acceso directo a su tarea principal |
| Dashboard · tarjetas y paneles | Icono de color distinto por indicador y por acceso, elevación al pasar el cursor, lista con flecha y estado del sistema como etiquetas | Mayor jerarquía visual |
| Gestión de usuarios | Entrada progresiva de filas, resaltado, avatar y etiqueta de rol con color, estado como etiqueta y transición al activar/desactivar | Tabla más fácil de escanear y respuesta visual inmediata |
| Auditoría | Línea de tiempo por día, avatar del responsable, icono por acción, etiqueta de color por módulo y filtro con contadores | Se identifica de un vistazo quién hizo qué, cuándo y en qué módulo |

## Foto del banner

El banner usa la foto `Frontend/public/images/administrador/banner-administrador.jpg` si existe; si no, muestra la ilustración incluida (`administracion-personal.svg`).
Formato recomendado: JPG, proporción 8:5 (por ejemplo 1120 × 700 px), menos de 300 KB. Tema: recepción o área administrativa de la clínica, o equipo de gestión con un panel de control.

## Accesibilidad

- Las animaciones se desactivan con `prefers-reduced-motion`.
- En alto contraste los colores de las etiquetas se reemplazan por bordes blancos.
- Se conservan `aria-label`, `role` y los textos para lectores de pantalla.

## Pendiente

- Actualizar el prototipo en Figma con estas pantallas.
