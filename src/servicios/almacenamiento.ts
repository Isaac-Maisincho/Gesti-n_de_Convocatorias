// ============================================================
// Almacenamiento en memoria — Capa de servicios
// ============================================================
// Simula la persistencia de datos durante la ejecución del
// servidor. Se usa un módulo singleton gracias al cache de
// módulos de Node.js.

import type {
  Convocatoria,
  Director,
  NotaConceptual,
} from '@/models/interfaces';

// ── Almacenes ────────────────────────────────────────────────
const convocatorias: Convocatoria[] = [];
const directores: Director[] = [];
const notas: NotaConceptual[] = [];

// ── Accessors: Convocatorias ─────────────────────────────────
export function obtenerConvocatorias(): Convocatoria[] {
  return convocatorias;
}

export function agregarConvocatoria(c: Convocatoria): void {
  convocatorias.push(c);
}

export function buscarConvocatoriaPorId(id: string): Convocatoria | undefined {
  return convocatorias.find((c) => c.id === id);
}

// ── Accessors: Directores ────────────────────────────────────
export function obtenerDirectores(): Director[] {
  return directores;
}

export function agregarDirector(d: Director): void {
  directores.push(d);
}

export function buscarDirectorPorId(id: string): Director | undefined {
  return directores.find((d) => d.id === id);
}

// ── Accessors: Notas Conceptuales ────────────────────────────
export function obtenerNotas(): NotaConceptual[] {
  return notas;
}

export function agregarNota(n: NotaConceptual): void {
  notas.push(n);
}

export function buscarNotaPorCodigo(codigo: string): NotaConceptual | undefined {
  return notas.find((n) => n.codigo === codigo);
}

export function actualizarNota(codigo: string, parcial: Partial<NotaConceptual>): boolean {
  const indice = notas.findIndex((n) => n.codigo === codigo);
  if (indice === -1) return false;
  notas[indice] = { ...notas[indice], ...parcial };
  return true;
}
