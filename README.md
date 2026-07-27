# Sistema de Gestión de Convocatoria de Notas Conceptuales

Sistema web para registrar y administrar **notas conceptuales** orientadas a
sostenibilidad territorial e impacto social, dentro de convocatorias
institucionales. El formulario de registro de una nota conceptual sigue la
estructura del **Anexo 1** de la convocatoria institucional (ver
[`docs/anexo1.md`](docs/anexo1.md) para el detalle de la correspondencia
campo por campo).

## Tecnología

- **Next.js 16** (App Router) + **React** + **TypeScript**
- **Tailwind CSS 4** para los estilos
- **Zod** para las validaciones (esquemas compartidos entre el formulario y
  la API)
- Persistencia en **archivos JSON** en `data/`, leídos y escritos desde
  Route Handlers de Next.js (`app/api/**`) — sin base de datos externa, por
  ser un proyecto académico
- Sin autenticación (no requerida por el enunciado)

## Estructura del proyecto

```
app/
  page.tsx                    Panel general (dashboard)
  convocatorias/page.tsx      Listar y crear convocatorias
  directores/page.tsx         Listar y registrar directores
  notas/page.tsx              Listar notas, buscar por código, filtrar
  notas/nueva/page.tsx        Registrar nota conceptual (formulario Anexo 1)
  notas/[id]/page.tsx         Detalle de una nota y cambio de estado
  api/convocatorias/          Route Handlers: GET, POST
  api/directores/             Route Handlers: GET, POST
  api/notas/                  Route Handlers: GET (filtros), POST
  api/notas/[id]/             Route Handler: GET
  api/notas/[id]/estado/      Route Handler: PATCH (cambiar estado)
  api/resumen/                Route Handler: GET (totales del panel)
components/
  ui.tsx                      Componentes base (Button, Input, Select, ...)
  NavBar.tsx                  Barra de navegación
  forms/                      Formularios cliente (crean/mutan datos)
lib/
  types.ts                    Modelo de datos (TypeScript)
  validations.ts              Esquemas Zod + reglas de negocio
  db.ts                       Lectura/escritura de los archivos JSON
  repositories/                CRUD, cálculo de totales, generación de código
data/
  convocatorias.json, directores.json, notas.json   Almacenamiento persistente
docs/
  anexo1.md                   Correspondencia entre el Anexo 1 y el sistema
  screenshots/                Capturas de ejecución
```

Las páginas de listado y detalle son **Server Components** que leen los
datos directamente de `lib/repositories`; los formularios de creación y
cambio de estado son **Client Components** que llaman a la API (`app/api/**`)
y refrescan la vista al terminar.

## Cómo ejecutar el proyecto

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

Otros comandos:

```bash
npm run build   # build de producción
npm start       # sirve el build de producción (después de "npm run build")
npm run lint    # ESLint
```


> **Nota:** los scripts `dev` y `build` usan `next ... --webpack` en lugar
> del bundler Turbopack (por defecto en Next.js 16). Esto es necesario
> porque Turbopack falla al compilar cuando la ruta del proyecto contiene
> caracteres acentuados (como "Gestión"); con `--webpack` el proyecto
> compila sin problema.

## Despliegue con Docker

El proyecto incluye un `Dockerfile` optimizado utilizando *multi-stage builds* con Node.js 20 sobre Alpine Linux para servir la aplicación de Next.js en producción.

### 1. Descargar la imagen (Pull)
Puedes descargarla directamente ejecutando:

```bash
sudo docker pull branpazmino/notas-conceptuales:latest
```

### 2. Ejecutar el contenedor (Run) Con persistencia de datos
Esta opción monta la carpeta `data/` de tu máquina local en el contenedor. Así, todos los cambios que realices se guardarán directamente en tu disco local y no se perderán si detienes o eliminas el contenedor.

```bash
sudo docker run -d \
  -p 3000:3000 \
  --name notas-conceptuales \
  -v $(pwd)/data:/app/data \
  branpazmino/notas-conceptuales:latest
```

## Funcionalidades implementadas

- Crear convocatorias (`/convocatorias`)
- Registrar directores (`/directores`)
- Registrar notas conceptuales con las 6 secciones del Anexo 1
  (`/notas/nueva`)
- Agregar ítems de presupuesto y actividades de cronograma de forma
  dinámica (agregar/quitar filas) dentro del formulario de la nota
- Cálculo automático del presupuesto total por nota
- Cambiar el estado de una nota: `registrada` → `en_revision` → `aprobada`
  / `rechazada` (`/notas/[id]`)
- Listar notas conceptuales, con búsqueda por código y filtros por estado
  y convocatoria (`/notas`)
- Cálculo del presupuesto general solicitado (suma de todas las notas),
  visible en el panel general (`/`)

## Validaciones implementadas

Todas centralizadas en `lib/validations.ts` (Zod) y aplicadas tanto en los
formularios como en los Route Handlers:

- El nombre/título de la nota conceptual no puede estar vacío
- El correo del director debe contener `@`
- La población objetivo no puede ser mayor que la población de referencia
- El presupuesto total de una nota no puede superar los USD 20 000
- La cantidad de cada ítem de presupuesto debe ser mayor que cero
- El valor unitario de cada ítem no puede ser negativo
- Cada nota debe tener al menos una actividad registrada en el cronograma

## Capturas de ejecución

Ver [`docs/screenshots/`](docs/screenshots/) — incluyen el panel general,
la creación de convocatorias y directores, los mensajes de validación en
pantalla, el formulario de registro de una nota conceptual, el detalle de
una nota creada y la búsqueda por código.
