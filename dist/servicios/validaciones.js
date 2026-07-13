"use strict";
// ============================================================
// Validaciones centralizadas — Capa de servicios
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarConvocatoria = validarConvocatoria;
exports.validarDirector = validarDirector;
exports.validarNotaConceptual = validarNotaConceptual;
exports.validarItemPresupuesto = validarItemPresupuesto;
exports.validarActividad = validarActividad;
exports.validarCambioEstado = validarCambioEstado;
exports.validarLimitePresupuesto = validarLimitePresupuesto;
const functions_1 = require("../models/functions");
// ── Validar Convocatoria ─────────────────────────────────────
function validarConvocatoria(datos) {
    const errores = [];
    if (!datos.anio || typeof datos.anio !== 'number' || datos.anio < 2020) {
        errores.push('El año de la convocatoria es obligatorio y debe ser un número mayor o igual a 2020.');
    }
    if (datos.estado && !['activa', 'inactiva'].includes(datos.estado)) {
        errores.push('El estado de la convocatoria debe ser "activa" o "inactiva".');
    }
    return errores;
}
// ── Validar Director ─────────────────────────────────────────
function validarDirector(datos) {
    const errores = [];
    if (!(0, functions_1.noVacio)(datos.nombre)) {
        errores.push('El nombre del director es obligatorio.');
    }
    if (!datos.correo || !(0, functions_1.esCorreoValido)(datos.correo)) {
        errores.push('El correo del director debe contener el carácter "@".');
    }
    if (!(0, functions_1.noVacio)(datos.telefono)) {
        errores.push('El teléfono del director es obligatorio.');
    }
    return errores;
}
// ── Validar Nota Conceptual ─────────────────────────────────
function validarNotaConceptual(datos) {
    const errores = [];
    // Nombre del proyecto no debe estar vacío
    if (!(0, functions_1.noVacio)(datos.nombreProyecto)) {
        errores.push('El nombre del proyecto no debe estar vacío.');
    }
    // Director requerido
    if (!(0, functions_1.noVacio)(datos.directorId)) {
        errores.push('El ID del director responsable es obligatorio.');
    }
    // Convocatoria requerida
    if (!(0, functions_1.noVacio)(datos.convocatoriaId)) {
        errores.push('El ID de la convocatoria es obligatorio.');
    }
    // Validar caracterización de población
    if (datos.caracterizacionPoblacion) {
        const { poblacionReferencia, poblacionObjetivo } = datos.caracterizacionPoblacion;
        if (typeof poblacionObjetivo === 'number' &&
            typeof poblacionReferencia === 'number' &&
            poblacionObjetivo > poblacionReferencia) {
            errores.push('La Población Objetivo no puede ser mayor que la Población de Referencia.');
        }
    }
    // Validar presupuesto
    if (datos.presupuesto?.items && datos.presupuesto.items.length > 0) {
        const total = (0, functions_1.calcularPresupuestoTotal)(datos.presupuesto.items);
        if (total > functions_1.LIMITE_PRESUPUESTO_USD) {
            errores.push(`El costo total del presupuesto (USD ${total.toFixed(2)}) supera el límite de USD ${functions_1.LIMITE_PRESUPUESTO_USD.toLocaleString()}.`);
        }
        datos.presupuesto.items.forEach((item, i) => {
            if (typeof item.cantidad !== 'number' || item.cantidad <= 0) {
                errores.push(`Ítem presupuestario #${i + 1}: la cantidad debe ser mayor que cero.`);
            }
            if (typeof item.valorUnitario !== 'number' || item.valorUnitario < 0) {
                errores.push(`Ítem presupuestario #${i + 1}: el valor unitario no puede ser negativo.`);
            }
        });
    }
    // Mínimo de actividades en cronograma
    if (!datos.cronograma || datos.cronograma.length < 1) {
        errores.push('La nota debe tener al menos una actividad registrada en su cronograma.');
    }
    return errores;
}
// ── Validar Ítem de Presupuesto ──────────────────────────────
function validarItemPresupuesto(item) {
    const errores = [];
    if (!(0, functions_1.noVacio)(item.descripcion)) {
        errores.push('La descripción del ítem presupuestario es obligatoria.');
    }
    if (typeof item.cantidad !== 'number' || item.cantidad <= 0) {
        errores.push('La cantidad debe ser mayor que cero.');
    }
    if (typeof item.valorUnitario !== 'number' || item.valorUnitario < 0) {
        errores.push('El valor unitario no puede ser negativo.');
    }
    return errores;
}
// ── Validar Actividad del Cronograma ─────────────────────────
function validarActividad(actividad) {
    const errores = [];
    if (!(0, functions_1.noVacio)(actividad.descripcion)) {
        errores.push('La descripción de la actividad es obligatoria.');
    }
    if (!(0, functions_1.noVacio)(actividad.fechaInicio)) {
        errores.push('La fecha de inicio de la actividad es obligatoria.');
    }
    if (!(0, functions_1.noVacio)(actividad.fechaFin)) {
        errores.push('La fecha de fin de la actividad es obligatoria.');
    }
    if (actividad.fechaInicio && actividad.fechaFin) {
        if (new Date(actividad.fechaInicio) > new Date(actividad.fechaFin)) {
            errores.push('La fecha de inicio no puede ser posterior a la fecha de fin.');
        }
    }
    return errores;
}
// ── Validar cambio de Estado ─────────────────────────────────
const ESTADOS_VALIDOS = [
    'registrada',
    'en revisión',
    'aprobada',
    'rechazada',
];
function validarCambioEstado(estado) {
    const errores = [];
    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
        errores.push(`El estado debe ser uno de: ${ESTADOS_VALIDOS.map((e) => `"${e}"`).join(', ')}.`);
    }
    return errores;
}
// ── Validar que el presupuesto total no exceda el límite ─────
function validarLimitePresupuesto(itemsActuales, nuevoItem) {
    const errores = [];
    const totalActual = (0, functions_1.calcularPresupuestoTotal)(itemsActuales);
    const nuevoTotal = Math.round((totalActual + nuevoItem.total) * 100) / 100;
    if (nuevoTotal > functions_1.LIMITE_PRESUPUESTO_USD) {
        errores.push(`Agregar este ítem excedería el límite de presupuesto. Total actual: USD ${totalActual.toFixed(2)}, nuevo total: USD ${nuevoTotal.toFixed(2)}, límite: USD ${functions_1.LIMITE_PRESUPUESTO_USD.toLocaleString()}.`);
    }
    return errores;
}
