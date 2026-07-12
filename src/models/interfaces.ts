// ============================================================
// Interfaces de TypeScript — Sistema de Gestión de Convocatorias
// ============================================================

// ── Convocatoria ──────────────────────────────────────────────
export type EstadoConvocatoria = 'activa' | 'inactiva';

export interface Convocatoria {
  id: string;
  anio: number;
  estado: EstadoConvocatoria;
}

// ── Director de Nota Conceptual ──────────────────────────────
export interface Director {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
}

// ── Localización y Cobertura ─────────────────────────────────
export type NivelCobertura =
  | 'Internacional'
  | 'Nacional'
  | 'Provincial'
  | 'Cantonal'
  | 'Parroquial'
  | 'Barrio';

export interface Localizacion {
  cobertura: NivelCobertura;
  provincia?: string;
  canton?: string;
  parroquia?: string;
  detalleUbicacion: string;
}

// ── Sector de Población Beneficiaria ─────────────────────────
export interface SectorPoblacion {
  urbanoMarginal: boolean;
  rural: boolean;
  grupoAtencionPrioritaria: boolean;
}

// ── Alineamiento ─────────────────────────────────────────────
export interface Alineamiento {
  ambitosPrioritarios: string[];
  objetivosODS2030: string[];
  camposCineUnesco: string[];
  objetivosPND: string[];
  objetivosGAD: string[];
  objetivosPlanEstrategico: string[];
  lineasInvestigacion: string[];
  dominioAcademico: string[];
}

// ── Departamento y Carrera ───────────────────────────────────
export interface Carrera {
  id: string;
  nombre: string;
}

export interface Departamento {
  id: string;
  nombre: string;
  carreras: Carrera[];
}

// ── Impactos Esperados ───────────────────────────────────────
export interface ImpactosEsperados {
  economico: string;
  social: string;
  politico: string;
  cientifico: string;
  ambiental: string;
  otros: string;
}

// ── Caracterización de la Población ──────────────────────────
export interface CaracterizacionPoblacion {
  poblacionReferencia: number;
  poblacionPotencial: number;
  poblacionObjetivo: number;
}

// ── Presupuesto ──────────────────────────────────────────────
export interface ItemPresupuesto {
  id: string;
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
  total: number;
}

export interface Presupuesto {
  items: ItemPresupuesto[];
  aporteEntidadAuspiciante: number;
}

// ── Cronograma ───────────────────────────────────────────────
export interface ActividadCronograma {
  id: string;
  descripcion: string;
  fechaInicio: string; // ISO 8601
  fechaFin: string;    // ISO 8601
  responsable: string;
}

// ── Firmas de Responsabilidad ────────────────────────────────
export interface FirmasResponsabilidad {
  directorNota: string;
  directorCarrera: string;
  coordinadorVinculacion: string;
  directorDepartamento: string;
}

// ── Estado de la Nota ────────────────────────────────────────
export type EstadoNota = 'registrada' | 'en revisión' | 'aprobada' | 'rechazada';

// ── Nota Conceptual (entidad principal) ──────────────────────
export interface NotaConceptual {
  codigo: string;
  convocatoriaId: string;

  // Datos Generales
  nombreProyecto: string;
  sedeUnidadAcademica: string;
  departamento: string;
  plazoEjecucion: {
    fechaInicio: string; // ISO 8601
    fechaFin: string;    // ISO 8601
  };
  directorId: string;

  // Secciones
  localizacion: Localizacion;
  sectorPoblacion: SectorPoblacion;
  alineamiento: Alineamiento;
  departamentosParticipantes: string[]; // IDs de departamentos
  carrerasParticipantes: string[];      // IDs de carreras
  impactosEsperados: ImpactosEsperados;
  caracterizacionPoblacion: CaracterizacionPoblacion;
  presupuesto: Presupuesto;
  cronograma: ActividadCronograma[];
  firmasResponsabilidad: FirmasResponsabilidad;

  // Estado
  estado: EstadoNota;
  creadoEn: string;   // ISO 8601
  actualizadoEn: string; // ISO 8601
}

// ── Paginación ───────────────────────────────────────────────
export interface PaginacionParams {
  pagina: number;
  limite: number;
}

export interface RespuestaPaginada<T> {
  datos: T[];
  paginacion: {
    paginaActual: number;
    totalPaginas: number;
    totalRegistros: number;
    limite: number;
  };
}

// ── Respuesta API genérica ───────────────────────────────────
export interface RespuestaAPI<T = unknown> {
  exito: boolean;
  mensaje: string;
  datos?: T;
}

// ── Ubicaciones (cascada) ────────────────────────────────────
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
