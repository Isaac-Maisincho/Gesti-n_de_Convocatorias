# Referencia al Anexo 1 de la convocatoria institucional

El formulario de registro de una nota conceptual
([`app/notas/nueva/page.tsx`](../app/notas/nueva/page.tsx) →
[`components/forms/NuevaNotaForm.tsx`](../components/forms/NuevaNotaForm.tsx))
y su vista de detalle ([`app/notas/[id]/page.tsx`](../app/notas/%5Bid%5D/page.tsx))
reproducen, en el mismo orden, las seis secciones que exige el Anexo 1 de la
convocatoria institucional. El modelo de datos en
[`lib/types.ts`](../lib/types.ts) (`NotaConceptual`) refleja exactamente esos
mismos campos.

| # | Sección del Anexo 1 | Campos en el sistema | Dónde vive |
|---|---|---|---|
| 1 | **Datos generales** | Código (autogenerado), título, convocatoria, director responsable, fecha de registro, resumen | `NotaConceptual.codigo/titulo/convocatoriaId/directorId/fechaRegistro/resumen` |
| 2 | **Alineamiento** | Objetivo institucional, línea estratégica, sostenibilidad territorial / impacto social | `NotaConceptual.objetivoInstitucional/lineaEstrategica/impactoSocial` |
| 3 | **Población beneficiaria** | Población de referencia, población objetivo, descripción de la población | `NotaConceptual.poblacionReferencia/poblacionObjetivo/descripcionPoblacion` |
| 4 | **Presupuesto** | Ítems (descripción, cantidad, valor unitario) y total calculado | `NotaConceptual.itemsPresupuesto[]`, `calcularTotalPresupuesto()` |
| 5 | **Cronograma** | Actividades (nombre, fecha de inicio, fecha de fin, responsable) | `NotaConceptual.actividades[]` |
| 6 | **Firmas de responsabilidad** | Nombre, cargo y fecha de quien firma | `NotaConceptual.nombreFirma/cargoFirma/fechaFirma` |

Adicionalmente, el Anexo 1 enmarca la nota conceptual dentro de una
**convocatoria** (con fechas de apertura/cierre) y exige identificar al
**director responsable** del proyecto; en el sistema esto corresponde a las
entidades `Convocatoria` y `Director`, registradas de forma independiente en
`/convocatorias` y `/directores` y luego seleccionadas al crear la nota.

Las validaciones de negocio del Anexo 1 (población objetivo no mayor a la de
referencia, presupuesto máximo de USD 20 000, cantidades e importes válidos,
al menos una actividad) están centralizadas en
[`lib/validations.ts`](../lib/validations.ts) y se aplican tanto en el
formulario como en la API, tal como se describe en el README.
