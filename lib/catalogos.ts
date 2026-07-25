// Catálogos estáticos del Anexo 1. Se leen de los JSON del directorio data/
// y no se modifican desde la aplicación: sólo alimentan los selectores y
// listas de verificación del formulario de nota conceptual.

import catalogosJson from "@/data/catalogos.json";
import departamentosJson from "@/data/departamentos-carreras.json";
import ubicacionesJson from "@/data/ubicaciones.json";
import { Catalogos, ClaveAlineamiento, Departamento, Provincia } from "./types";

export const catalogos: Catalogos = catalogosJson;
export const departamentos: Departamento[] = departamentosJson;
export const provincias: Provincia[] = ubicacionesJson;

export const SEDES = [
  "Matriz Sangolquí",
  "Campus Latacunga",
  "Campus Tumbaco",
  "URC Guayaquil",
  "Sede Ibarra",
];

export const ALINEAMIENTO_GRUPOS: { key: ClaveAlineamiento; label: string }[] = [
  { key: "ambitosPrioritarios", label: "Ámbitos prioritarios" },
  { key: "objetivosODS2030", label: "Objetivos ODS 2030" },
  { key: "camposCineUnesco", label: "Campos CINE-UNESCO" },
  { key: "objetivosPND", label: "Objetivos PND" },
  { key: "objetivosGAD", label: "Objetivos GAD" },
  { key: "objetivosPlanEstrategico", label: "Objetivos del Plan Estratégico" },
  { key: "lineasInvestigacion", label: "Líneas de investigación" },
  { key: "dominioAcademico", label: "Dominio académico" },
];

export const CLAVES_ALINEAMIENTO = ALINEAMIENTO_GRUPOS.map((g) => g.key);

export function obtenerProvincia(id: string): Provincia | undefined {
  return provincias.find((p) => p.id === id);
}

export function obtenerCanton(provinciaId: string, cantonId: string) {
  return obtenerProvincia(provinciaId)?.cantones.find((c) => c.id === cantonId);
}

export function nombreProvincia(id: string): string {
  return obtenerProvincia(id)?.nombre ?? id;
}

export function nombreCanton(provinciaId: string, cantonId: string): string {
  return obtenerCanton(provinciaId, cantonId)?.nombre ?? cantonId;
}

export function nombreParroquia(
  provinciaId: string,
  cantonId: string,
  parroquiaId: string
): string {
  return (
    obtenerCanton(provinciaId, cantonId)?.parroquias.find((p) => p.id === parroquiaId)
      ?.nombre ?? parroquiaId
  );
}

export function nombreDepartamento(id: string): string {
  return departamentos.find((d) => d.id === id)?.nombre ?? id;
}

export function nombreCarrera(id: string): string {
  for (const dep of departamentos) {
    const carrera = dep.carreras.find((c) => c.id === id);
    if (carrera) return carrera.nombre;
  }
  return id;
}
