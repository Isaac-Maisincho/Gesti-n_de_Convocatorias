# Resumen Técnico: Sistema de Gestión de Convocatorias

Este documento proporciona una descripción técnica detallada del sistema de gestión y validación de notas conceptuales para convocatorias de proyectos. La aplicación está construida como un servicio **Backend RESTful** puro utilizando **Node.js, Express y TypeScript**, estructurado bajo un diseño modular que separa la definición del dominio de la lógica de negocio y la persistencia en memoria.

---

## 1. Arquitectura y Estructura del Código

El código fuente de TypeScript se encuentra estructurado en el directorio `src/` de la siguiente forma:

```
src/
├── data/
│   ├── catalogos.json
│   ├── departamentos-carreras.json
│   └── ubicaciones.json
├── models/
│   ├── functions.ts
│   └── interfaces.ts
├── servicios/
│   ├── almacenamiento.ts
│   ├── convocatorias.service.ts
│   ├── directores.service.ts
│   ├── estadisticas.service.ts
│   ├── notas.service.ts
│   └── validaciones.ts
└── index.ts
```

### Carpetas Principales y su Propósito
*   `src/models/`:
    *   `interfaces.ts`: Define el sistema de tipos e interfaces estrictas que representan a las entidades del dominio (`NotaConceptual`, `Convocatoria`, `Director`, `Presupuesto`, `Cronograma`, etc.) y las estructuras de respuesta de la API.
    *   `functions.ts`: Contiene utilidades y funciones puras para la generación de IDs (UUID v4), generación de códigos con formato estructurado, validaciones básicas, lógica matemática (sumatorias y redondeo de moneda) y paginación genérica.
*   `src/servicios/`:
    *   `almacenamiento.ts`: Implementa un almacén en memoria para simular la base de datos (con datos quemados iniciales para demostraciones y pruebas). Al exportar funciones directas sobre arreglos compartidos, actúa como un Singleton en Node.js gracias al sistema de caché de módulos.
    *   `validaciones.ts`: Centraliza la lógica de verificación y validación de restricciones e integridad de los datos recibidos en las solicitudes HTTP.
    *   `notas.service.ts`: Servicio principal encargado del ciclo de vida de las Notas Conceptuales (creación, edición, consulta, adición de ítems y actividades, y cálculo de totales).
    *   `convocatorias.service.ts`: Maneja la creación y consulta de convocatorias.
    *   `directores.service.ts`: Gestiona el registro y consulta de los directores de proyectos.
    *   `estadisticas.service.ts`: Agrega métricas financieras e informativas sobre las notas conceptuales del sistema.
*   `src/data/`:
    *   Archivos JSON estáticos (`catalogos.json`, `departamentos-carreras.json`, `ubicaciones.json`) que actúan como repositorios de datos geográficos e institucionales invariables.

---

## 2. Reglas de Negocio y Funcionalidades Clave

El backend implementa de manera estricta y nativa en TypeScript las siguientes validaciones y lógicas de negocio:

1.  **Validación de Presupuesto**:
    *   Cada ítem de presupuesto cuenta con cálculo automático de totales (`cantidad * valorUnitario`).
    *   Existe un límite presupuestario global de **USD 20,000.00** por nota conceptual. Las validaciones impiden registrar notas o añadir nuevos ítems individuales que hagan que el costo total de la nota supere este monto.
2.  **Validaciones Demográficas Coherentes**:
    *   En la caracterización de la población beneficiaria, se valida lógicamente que la **Población Objetivo** no sea superior a la **Población de Referencia**.
3.  **Consistencia Cronológica**:
    *   Toda nota conceptual debe tener al menos una actividad registrada en su cronograma.
    *   Se valida que la fecha de inicio de cualquier actividad en el cronograma no sea posterior a la fecha de fin de la misma.
4.  **Validación de Contactos**:
    *   Se obliga a que el correo electrónico del director sea una cadena válida que contenga el carácter `@`.
5.  **Flujo y Transiciones de Estado**:
    *   Los estados válidos para una nota conceptual son: `registrada`, `en revisión`, `aprobada` y `rechazada`. Se controla estrictamente que solo se realicen transiciones entre estos estados permitidos.
6.  **Paginación Eficiente**:
    *   El listado de notas conceptuales incluye parámetros opcionales de paginación (`pagina` y `limite`) procesados en el backend para evitar la sobrecarga de datos en el cliente.

---

## 3. Endpoints del API REST (`src/index.ts`)

El archivo de entrada `index.ts` expone el enrutador de Express con los siguientes endpoints disponibles:

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| **GET** | `/api/convocatorias` | Obtiene el listado de convocatorias. |
| **POST** | `/api/convocatorias` | Registra una nueva convocatoria. |
| **GET** | `/api/catalogos` | Devuelve el catálogo estático para alineamientos institucionales y ODS. |
| **GET** | `/api/departamentos-carreras` | Retorna los departamentos universitarios y sus respectivas carreras. |
| **GET** | `/api/directores` | Obtiene la lista de directores registrados. |
| **POST** | `/api/directores` | Registra un nuevo director académico. |
| **GET** | `/api/notas` | Lista las notas conceptuales creadas (soporta paginación por query params: `?pagina=1&limite=10`). |
| **POST** | `/api/notas` | Registra una nueva nota conceptual, asignándole un código del formato `NC-YYYY-XXXX`. |
| **GET** | `/api/notas/:codigo` | Devuelve el detalle completo de una nota conceptual filtrando por su código. |
| **PATCH** | `/api/notas/:codigo/estado` | Modifica el estado de una nota (`registrada`, `en revisión`, `aprobada`, `rechazada`). |
| **GET** | `/api/notas/:codigo/presupuesto-total` | Devuelve el costo total sumado de la nota, la cantidad de ítems y el aporte del auspiciante. |
| **GET** | `/api/estadisticas/presupuesto-general` | Retorna estadísticas consolidadas del sistema (presupuesto total, promedio por nota y conteo por estados). |
| **GET** | `/api/ubicaciones` | Endpoint jerárquico dinámico. Si no recibe parámetros, lista provincias. Si recibe `?provinciaId=...`, lista cantones de esa provincia. Si recibe `?provinciaId=...&cantonId=...`, lista las parroquias. |
