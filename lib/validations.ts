import { z } from "zod";
import { ESTADOS_NOTA, NIVELES_COBERTURA, NivelCobertura } from "./types";

export const PRESUPUESTO_MAX_USD = 20000;

export const convocatoriaSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre de la convocatoria es obligatorio."),
  fechaApertura: z.string().min(1, "La fecha de apertura es obligatoria."),
  fechaCierre: z.string().min(1, "La fecha de cierre es obligatoria."),
  estado: z.enum(["abierta", "cerrada"]),
  descripcion: z.string().trim().optional().default(""),
});

export const directorSchema = z.object({
  nombres: z.string().trim().min(1, "El nombre del director es obligatorio."),
  correo: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio.")
    .refine((v) => v.includes("@"), "El correo debe contener '@'."),
  cargo: z.string().trim().optional().default(""),
  institucion: z.string().trim().optional().default(""),
  telefono: z.string().trim().optional().default(""),
});

export const itemPresupuestoSchema = z.object({
  descripcion: z.string().trim().min(1, "La descripción del ítem es obligatoria."),
  cantidad: z.coerce
    .number({ error: "La cantidad debe ser un número." })
    .gt(0, "La cantidad debe ser mayor que cero."),
  valorUnitario: z.coerce
    .number({ error: "El valor unitario debe ser un número." })
    .min(0, "El valor unitario no puede ser negativo."),
});

export const actividadSchema = z
  .object({
    nombre: z.string().trim().min(1, "El nombre de la actividad es obligatorio."),
    fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria."),
    fechaFin: z.string().min(1, "La fecha de fin es obligatoria."),
    responsable: z.string().trim().min(1, "El responsable es obligatorio."),
  })
  .check((ctx) => {
    const { fechaInicio, fechaFin } = ctx.value;
    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      ctx.issues.push({
        code: "custom",
        message: "La fecha de inicio no puede ser posterior a la fecha de fin.",
        path: ["fechaFin"],
        input: fechaFin,
      });
    }
  });

export const localizacionSchema = z.object({
  cobertura: z.enum(NIVELES_COBERTURA as [NivelCobertura, ...NivelCobertura[]]),
  provincia: z.string().trim().optional().default(""),
  canton: z.string().trim().optional().default(""),
  parroquia: z.string().trim().optional().default(""),
  detalleUbicacion: z.string().trim().optional().default(""),
});

export const sectorPoblacionSchema = z.object({
  urbanoMarginal: z.boolean().optional().default(false),
  rural: z.boolean().optional().default(false),
  grupoAtencionPrioritaria: z.boolean().optional().default(false),
});

const listaAlineamiento = z.array(z.string()).optional().default([]);

export const alineamientoSchema = z.object({
  ambitosPrioritarios: listaAlineamiento,
  objetivosODS2030: listaAlineamiento,
  camposCineUnesco: listaAlineamiento,
  objetivosPND: listaAlineamiento,
  objetivosGAD: listaAlineamiento,
  objetivosPlanEstrategico: listaAlineamiento,
  lineasInvestigacion: listaAlineamiento,
  dominioAcademico: listaAlineamiento,
});

export const impactosEsperadosSchema = z.object({
  economico: z.string().trim().optional().default(""),
  social: z.string().trim().optional().default(""),
  politico: z.string().trim().optional().default(""),
  cientifico: z.string().trim().optional().default(""),
  ambiental: z.string().trim().optional().default(""),
  otros: z.string().trim().optional().default(""),
});

export const caracterizacionPoblacionSchema = z.object({
  poblacionReferencia: z.coerce
    .number({ error: "La población de referencia debe ser un número." })
    .min(0, "La población de referencia no puede ser negativa."),
  poblacionPotencial: z.coerce
    .number({ error: "La población potencial debe ser un número." })
    .min(0, "La población potencial no puede ser negativa."),
  poblacionObjetivo: z.coerce
    .number({ error: "La población objetivo debe ser un número." })
    .min(0, "La población objetivo no puede ser negativa."),
  descripcion: z.string().trim().optional().default(""),
});

export const firmasSchema = z.object({
  directorNota: z.string().trim().min(1, "El director de la nota es obligatorio."),
  directorCarrera: z.string().trim().optional().default(""),
  coordinadorVinculacion: z.string().trim().optional().default(""),
  directorDepartamento: z.string().trim().optional().default(""),
  fechaFirma: z.string().min(1, "La fecha de firma es obligatoria."),
});

export const notaConceptualSchema = z
  .object({
    // 1. Datos generales
    titulo: z.string().trim().min(1, "El nombre de la nota conceptual no puede estar vacío."),
    convocatoriaId: z.string().min(1, "Debe seleccionar una convocatoria."),
    directorId: z.string().min(1, "Debe seleccionar un director."),
    sedeUnidadAcademica: z.string().trim().min(1, "Debe seleccionar la sede o unidad académica."),
    departamento: z.string().trim().min(1, "Debe seleccionar el departamento."),
    fechaRegistro: z.string().min(1, "La fecha de registro es obligatoria."),
    plazoInicio: z.string().min(1, "La fecha de inicio del plazo de ejecución es obligatoria."),
    plazoFin: z.string().min(1, "La fecha de fin del plazo de ejecución es obligatoria."),
    resumen: z.string().trim().optional().default(""),

    // 2 a 7
    localizacion: localizacionSchema,
    sectorPoblacion: sectorPoblacionSchema,
    alineamiento: alineamientoSchema,
    departamentosParticipantes: z.array(z.string()).optional().default([]),
    carrerasParticipantes: z.array(z.string()).optional().default([]),
    impactosEsperados: impactosEsperadosSchema,
    caracterizacionPoblacion: caracterizacionPoblacionSchema,

    // 8. Presupuesto
    itemsPresupuesto: z
      .array(itemPresupuestoSchema)
      .min(1, "Debe agregar al menos un ítem de presupuesto."),
    aporteEntidadAuspiciante: z.coerce
      .number({ error: "El aporte de la entidad auspiciante debe ser un número." })
      .min(0, "El aporte de la entidad auspiciante no puede ser negativo.")
      .optional()
      .default(0),

    // 9. Cronograma
    actividades: z
      .array(actividadSchema)
      .min(1, "Cada nota debe tener al menos una actividad registrada en el cronograma."),

    // 10. Firmas
    firmas: firmasSchema,
  })
  .check((ctx) => {
    const nota = ctx.value;

    if (nota.plazoInicio && nota.plazoFin && nota.plazoInicio > nota.plazoFin) {
      ctx.issues.push({
        code: "custom",
        message: "La fecha de inicio del plazo no puede ser posterior a la fecha de fin.",
        path: ["plazoFin"],
        input: nota.plazoFin,
      });
    }

    const { poblacionReferencia, poblacionPotencial, poblacionObjetivo } =
      nota.caracterizacionPoblacion;

    if (poblacionObjetivo > poblacionReferencia) {
      ctx.issues.push({
        code: "custom",
        message:
          "La población objetivo no puede ser mayor que la población de referencia.",
        path: ["caracterizacionPoblacion", "poblacionObjetivo"],
        input: poblacionObjetivo,
      });
    }

    if (poblacionPotencial > poblacionReferencia) {
      ctx.issues.push({
        code: "custom",
        message:
          "La población potencial no puede ser mayor que la población de referencia.",
        path: ["caracterizacionPoblacion", "poblacionPotencial"],
        input: poblacionPotencial,
      });
    }

    // La localización sólo exige provincia/cantón/parroquia según el nivel
    // de cobertura declarado, igual que el Anexo 1.
    const { cobertura, provincia, canton, parroquia } = nota.localizacion;
    const exigeProvincia = ["Provincial", "Cantonal", "Parroquial", "Barrio"].includes(cobertura);
    const exigeCanton = ["Cantonal", "Parroquial", "Barrio"].includes(cobertura);
    const exigeParroquia = ["Parroquial", "Barrio"].includes(cobertura);

    if (exigeProvincia && !provincia) {
      ctx.issues.push({
        code: "custom",
        message: `Debe seleccionar la provincia para una cobertura ${cobertura.toLowerCase()}.`,
        path: ["localizacion", "provincia"],
        input: provincia,
      });
    }
    if (exigeCanton && !canton) {
      ctx.issues.push({
        code: "custom",
        message: `Debe seleccionar el cantón para una cobertura ${cobertura.toLowerCase()}.`,
        path: ["localizacion", "canton"],
        input: canton,
      });
    }
    if (exigeParroquia && !parroquia) {
      ctx.issues.push({
        code: "custom",
        message: `Debe seleccionar la parroquia para una cobertura ${cobertura.toLowerCase()}.`,
        path: ["localizacion", "parroquia"],
        input: parroquia,
      });
    }

    if (nota.departamentosParticipantes.length === 0) {
      ctx.issues.push({
        code: "custom",
        message: "Debe seleccionar al menos un departamento participante.",
        path: ["departamentosParticipantes"],
        input: nota.departamentosParticipantes,
      });
    }

    const total = nota.itemsPresupuesto.reduce(
      (acc, item) => acc + item.cantidad * item.valorUnitario,
      0
    );
    if (total > PRESUPUESTO_MAX_USD) {
      ctx.issues.push({
        code: "custom",
        message: `El presupuesto total de la nota (USD ${total.toLocaleString(
          "en-US"
        )}) no puede superar los USD ${PRESUPUESTO_MAX_USD.toLocaleString(
          "en-US"
        )}.`,
        path: ["itemsPresupuesto"],
        input: nota.itemsPresupuesto,
      });
    }
  });

export const cambiarEstadoSchema = z.object({
  estado: z.enum(ESTADOS_NOTA as [string, ...string[]]),
});

export function calcularTotalPresupuesto(items: { cantidad: number; valorUnitario: number }[]) {
  return items.reduce((acc, item) => acc + item.cantidad * item.valorUnitario, 0);
}

export type ConvocatoriaInput = z.infer<typeof convocatoriaSchema>;
export type DirectorInput = z.infer<typeof directorSchema>;
export type NotaConceptualInput = z.infer<typeof notaConceptualSchema>;
