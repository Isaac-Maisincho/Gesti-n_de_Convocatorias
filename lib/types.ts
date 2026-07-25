// Modelo de datos del sistema, basado en las secciones del Anexo 1:
// datos generales, localización, sector de población, alineamiento,
// departamentos y carreras participantes, impactos esperados,
// caracterización de la población, presupuesto, cronograma y firmas.

export type EstadoConvocatoria = "abierta" | "cerrada";

export interface Convocatoria {
  id: string;
  nombre: string;
  fechaApertura: string;
  fechaCierre: string;
  estado: EstadoConvocatoria;
  descripcion: string;
  creadaEn: string;
}

export interface Director {
  id: string;
  nombres: string;
  correo: string;
  cargo: string;
  institucion: string;
  telefono: string;
  creadoEn: string;
}

export interface ItemPresupuesto {
  id: string;
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
}

export interface ActividadCronograma {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  responsable: string;
}

// ── Catálogos estáticos ──────────────────────────────────────

export interface Carrera {
  id: string;
  nombre: string;
}

export interface Departamento {
  id: string;
  nombre: string;
  carreras: Carrera[];
}

export interface Parroquia {
  id: string;
  nombre: string;
}

export interface Canton {
  id: string;
  nombre: string;
  parroquias: Parroquia[];
}

export interface Provincia {
  id: string;
  nombre: string;
  cantones: Canton[];
}

export interface Catalogos {
  ambitosPrioritarios: string[];
  objetivosODS2030: string[];
  camposCineUnesco: string[];
  objetivosPND: string[];
  objetivosGAD: string[];
  objetivosPlanEstrategico: string[];
  lineasInvestigacion: string[];
  dominioAcademico: string[];
}

export type ClaveAlineamiento = keyof Catalogos;

// ── Secciones de la nota conceptual ──────────────────────────

export type NivelCobertura =
  | "Internacional"
  | "Nacional"
  | "Provincial"
  | "Cantonal"
  | "Parroquial"
  | "Barrio";

export const NIVELES_COBERTURA: NivelCobertura[] = [
  "Internacional",
  "Nacional",
  "Provincial",
  "Cantonal",
  "Parroquial",
  "Barrio",
];

export interface Localizacion {
  cobertura: NivelCobertura;
  provincia: string;
  canton: string;
  parroquia: string;
  detalleUbicacion: string;
}

export interface SectorPoblacion {
  urbanoMarginal: boolean;
  rural: boolean;
  grupoAtencionPrioritaria: boolean;
}

export type Alineamiento = Record<ClaveAlineamiento, string[]>;

export interface ImpactosEsperados {
  economico: string;
  social: string;
  politico: string;
  cientifico: string;
  ambiental: string;
  otros: string;
}

export interface CaracterizacionPoblacion {
  poblacionReferencia: number;
  poblacionPotencial: number;
  poblacionObjetivo: number;
  descripcion: string;
}

export interface FirmasResponsabilidad {
  directorNota: string;
  directorCarrera: string;
  coordinadorVinculacion: string;
  directorDepartamento: string;
  fechaFirma: string;
}

export type EstadoNota =
  | "registrada"
  | "en_revision"
  | "aprobada"
  | "rechazada";

export const ESTADOS_NOTA: EstadoNota[] = [
  "registrada",
  "en_revision",
  "aprobada",
  "rechazada",
];

export interface NotaConceptual {
  id: string;
  codigo: string;

  // 1. Datos generales
  titulo: string;
  convocatoriaId: string;
  directorId: string;
  sedeUnidadAcademica: string;
  departamento: string;
  fechaRegistro: string;
  plazoInicio: string;
  plazoFin: string;
  resumen: string;

  // 2. Localización geográfica
  localizacion: Localizacion;

  // 3. Sector de población beneficiaria
  sectorPoblacion: SectorPoblacion;

  // 4. Alineamiento
  alineamiento: Alineamiento;

  // 5. Departamentos y carreras participantes
  departamentosParticipantes: string[];
  carrerasParticipantes: string[];

  // 6. Impactos esperados
  impactosEsperados: ImpactosEsperados;

  // 7. Caracterización de la población
  caracterizacionPoblacion: CaracterizacionPoblacion;

  // 8. Presupuesto
  itemsPresupuesto: ItemPresupuesto[];
  aporteEntidadAuspiciante: number;

  // 9. Cronograma
  actividades: ActividadCronograma[];

  // 10. Firmas de responsabilidad
  firmas: FirmasResponsabilidad;

  estado: EstadoNota;
  creadaEn: string;
  actualizadaEn: string;
}

export type NuevaConvocatoria = Omit<Convocatoria, "id" | "creadaEn">;
export type NuevoDirector = Omit<Director, "id" | "creadoEn">;
export type NuevoItemPresupuesto = Omit<ItemPresupuesto, "id">;
export type NuevaActividadCronograma = Omit<ActividadCronograma, "id">;
export type NuevaNotaConceptual = Omit<
  NotaConceptual,
  "id" | "codigo" | "estado" | "creadaEn" | "actualizadaEn" | "itemsPresupuesto" | "actividades"
> & {
  itemsPresupuesto: NuevoItemPresupuesto[];
  actividades: NuevaActividadCronograma[];
};
