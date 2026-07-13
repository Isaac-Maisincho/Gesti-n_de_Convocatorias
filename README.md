# Sistema de Gestión de Convocatorias de Notas Conceptuales

## Objetivo
Este proyecto es un sistema sencillo en TypeScript para gestionar convocatorias de notas conceptuales. Permite crear y editar notas conceptuales, administrar presupuestos y cronogramas, y consultar el estado de las propuestas.

## Organización de carpetas
- `src/`
  - `index.ts` - servidor y rutas API.
  - `data/` - archivos JSON con catálogos, departamentos/carreras y ubicaciones.
  - `models/` - interfaces y funciones de negocio.
  - `public/` - frontend estático:
    - `app.ts` - lógica del cliente.
    - `index.html` - UI principal.
    - `styles.css` - estilos de la aplicación.
  - `servicios/` - servicios del backend y validaciones.

## Comandos
- `npm install` - instala las dependencias.
- `npm run build` - compila TypeScript y genera los archivos de salida.
- `docker compose up --build` - construye y levanta el proyecto en contenedores.

## Ejecución con Docker
1. Asegúrate de estar en la carpeta del proyecto.
2. Ejecuta:

```bash
docker compose up --build
```

3. Abre el navegador en `http://localhost:8080`.

4. Docker Hub


## Notas
- El frontend se sirve como archivos estáticos desde `src/public/`.
- La lógica de negocio y validaciones están en `src/servicios/`.
