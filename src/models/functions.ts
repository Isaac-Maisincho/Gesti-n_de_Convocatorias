// ============================================================
// Funciones puras y utilidades — Sistema de Gestión de Convocatorias
// ============================================================

import { randomUUID } from 'crypto';
import type { PaginacionParams, RespuestaPaginada } from './interfaces';

/**
 * Genera un identificador único universal (UUID v4).
 */
export function generarId(): string {
  return randomUUID();
}

/**
 * Genera un código único para una nota conceptual.
 * Formato: NC-YYYY-XXXX (ej. NC-2026-A3F1)
 */
export function generarCodigoNota(anio: number): string {
  const sufijo = randomUUID().slice(0, 4).toUpperCase();
  return `NC-${anio}-${sufijo}`;
}

/**
 * Retorna la fecha/hora actual en formato ISO 8601.
 */
export function fechaActual(): string {
  return new Date().toISOString();
}

/**
 * Valida que un string de correo electrónico contenga '@'.
 */
export function esCorreoValido(correo: string): boolean {
  return typeof correo === 'string' && correo.includes('@');
}

/**
 * Valida que un string no esté vacío.
 */
export function noVacio(valor: string | undefined | null): boolean {
  return typeof valor === 'string' && valor.trim().length > 0;
}

/**
 * Calcula el total de un ítem presupuestario (cantidad * valorUnitario).
 */
export function calcularTotalItem(cantidad: number, valorUnitario: number): number {
  return Math.round(cantidad * valorUnitario * 100) / 100;
}

/**
 * Calcula la suma total de un arreglo de ítems presupuestarios.
 */
export function calcularPresupuestoTotal(items: { total: number }[]): number {
  return Math.round(
    items.reduce((suma, item) => suma + item.total, 0) * 100
  ) / 100;
}

/**
 * Límite máximo de presupuesto en USD.
 */
export const LIMITE_PRESUPUESTO_USD = 20_000;

/**
 * Aplica paginación a un arreglo de datos.
 */
export function paginar<T>(
  datos: T[],
  params: PaginacionParams
): RespuestaPaginada<T> {
  const { pagina, limite } = params;
  const totalRegistros = datos.length;
  const totalPaginas = Math.ceil(totalRegistros / limite) || 1;
  const paginaSegura = Math.max(1, Math.min(pagina, totalPaginas));
  const inicio = (paginaSegura - 1) * limite;
  const fin = inicio + limite;

  return {
    datos: datos.slice(inicio, fin),
    paginacion: {
      paginaActual: paginaSegura,
      totalPaginas,
      totalRegistros,
      limite,
    },
  };
}
