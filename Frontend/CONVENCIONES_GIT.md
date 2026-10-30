# Convenciones de Git del equipo

Estas convenciones ayudan a mantener un historial claro y consistente. Son acuerdos del equipo, no requisitos obligatorios de Git. Los mensajes de commit siguen **Conventional Commits**.

## Nombres de ramas

Usa la sintaxis `<tipo>/<descripcion-corta>`:

```text
feature/registro-pacientes
fix/validacion-correo
style/ajuste-espaciado-formulario
refactor/organizacion-rutas
docs/convenciones-git
test/validacion-formulario
chore/configuracion-inicial
```

- Escribe en minúsculas y separa las palabras con guiones.
- No uses espacios, tildes ni caracteres especiales.
- Elige una descripción breve, específica y que indique el propósito del cambio.
- Usa `feature` para ramas de nuevas funcionalidades; no uses `featur`.
- En los commits correspondientes usa `feat`, no `feature`.

## Mensajes de commit

Usa la sintaxis `<tipo>(<alcance-opcional>): <descripcion-breve>`:

```text
feat(pacientes): agregar formulario de registro
fix(auth): corregir validacion de correo
style(home): ajustar espaciado del encabezado
refactor(core): simplificar configuracion de rutas
docs(git): documentar convenciones del equipo
test(pacientes): agregar pruebas del formulario
chore(config): configurar alias de importacion
build(deps): actualizar dependencias de compilacion
ci: configurar verificacion de compilacion
perf(pacientes): optimizar filtrado de resultados
revert: revertir cambio de validacion de correo
```

### Tipos

- `feat`: agrega una nueva funcionalidad.
- `fix`: corrige un error.
- `style`: cambia el formato del código (espacios, sangría o punto y coma) sin modificar su comportamiento.
- `refactor`: reorganiza código sin agregar funcionalidades ni corregir errores.
- `docs`: modifica documentación.
- `test`: agrega o modifica pruebas.
- `chore`: realiza tareas de mantenimiento que no encajan en los otros tipos.
- `build`: modifica dependencias o el sistema de compilación.
- `ci`: modifica la integración o automatización de verificaciones.
- `perf`: mejora el rendimiento.
- `revert`: revierte un cambio anterior.

Un cambio visual en CSS no es automáticamente `style`: usa `fix` si corrige un defecto visual o `feat` si incorpora una capacidad visual nueva. Elige el tipo según el propósito del cambio.

### Reglas

- Usa los tipos en inglés y las descripciones en español.
- Escribe una descripción breve y concreta, preferiblemente en imperativo: agregar, corregir, actualizar.
- No termines la descripción con punto.
- El alcance es opcional e identifica la feature o el área afectada.
- Cada commit representa un cambio coherente.
- Evita mensajes como «cambios», «avance», «arreglos» o «actualizacion».
- Revisa los archivos antes de incluirlos en un commit.
- No incluyas contraseñas, tokens ni archivos `.env` con secretos.
- Identifica los cambios incompatibles con `!` antes de los dos puntos (por ejemplo, `feat(api)!: cambiar formato de respuesta`) y descríbelos en el cuerpo con `BREAKING CHANGE:`.

## Ejemplo de flujo de trabajo

```text
git switch -c feature/registro-pacientes
git status
git diff
git add <archivo-o-ruta>
git diff --staged
git commit -m "feat(pacientes): agregar formulario de registro"
git push -u origin feature/registro-pacientes
```

Reemplaza `<archivo-o-ruta>` por los archivos correspondientes. El comando `push` requiere un remoto `origin` configurado.
