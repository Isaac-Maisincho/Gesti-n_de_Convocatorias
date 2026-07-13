"use strict";
// ============================================================
// Funciones puras y utilidades — Sistema de Gestión de Convocatorias
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.LIMITE_PRESUPUESTO_USD = void 0;
exports.generarId = generarId;
exports.generarCodigoNota = generarCodigoNota;
exports.fechaActual = fechaActual;
exports.esCorreoValido = esCorreoValido;
exports.noVacio = noVacio;
exports.calcularTotalItem = calcularTotalItem;
exports.calcularPresupuestoTotal = calcularPresupuestoTotal;
exports.paginar = paginar;
const crypto_1 = require("crypto");
/**
 * Genera un identificador único universal (UUID v4).
 */
function generarId() {
    return (0, crypto_1.randomUUID)();
}
/**
 * Genera un código único para una nota conceptual.
 * Formato: NC-YYYY-XXXX (ej. NC-2026-A3F1)
 */
function generarCodigoNota(anio) {
    const sufijo = (0, crypto_1.randomUUID)().slice(0, 4).toUpperCase();
    return `NC-${anio}-${sufijo}`;
}
/**
 * Retorna la fecha/hora actual en formato ISO 8601.
 */
function fechaActual() {
    return new Date().toISOString();
}
/**
 * Valida que un string de correo electrónico contenga '@'.
 */
function esCorreoValido(correo) {
    return typeof correo === 'string' && correo.includes('@');
}
/**
 * Valida que un string no esté vacío.
 */
function noVacio(valor) {
    return typeof valor === 'string' && valor.trim().length > 0;
}
/**
 * Calcula el total de un ítem presupuestario (cantidad * valorUnitario).
 */
function calcularTotalItem(cantidad, valorUnitario) {
    return Math.round(cantidad * valorUnitario * 100) / 100;
}
/**
 * Calcula la suma total de un arreglo de ítems presupuestarios.
 */
function calcularPresupuestoTotal(items) {
    return Math.round(items.reduce((suma, item) => suma + item.total, 0) * 100) / 100;
}
/**
 * Límite máximo de presupuesto en USD.
 */
exports.LIMITE_PRESUPUESTO_USD = 20_000;
/**
 * Aplica paginación a un arreglo de datos.
 */
function paginar(datos, params) {
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
