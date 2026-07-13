"use strict";
// ============================================================
// Servicio de Estadísticas — Lógica de negocio
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerPresupuestoGeneral = obtenerPresupuestoGeneral;
const functions_1 = require("../models/functions");
const almacenamiento_1 = require("./almacenamiento");
/**
 * Calcula la sumatoria de todos los presupuestos de las notas registradas
 * y estadísticas adicionales.
 */
function obtenerPresupuestoGeneral() {
    const notas = (0, almacenamiento_1.obtenerNotas)();
    const presupuestoGeneral = notas.reduce((suma, nota) => {
        return suma + (0, functions_1.calcularPresupuestoTotal)(nota.presupuesto.items);
    }, 0);
    const totalNotas = notas.length;
    const promedioPorNota = totalNotas > 0
        ? Math.round((presupuestoGeneral / totalNotas) * 100) / 100
        : 0;
    const conteosPorEstado = {
        registrada: notas.filter((n) => n.estado === 'registrada').length,
        'en revisión': notas.filter((n) => n.estado === 'en revisión').length,
        aprobada: notas.filter((n) => n.estado === 'aprobada').length,
        rechazada: notas.filter((n) => n.estado === 'rechazada').length,
    };
    return {
        exito: true,
        mensaje: 'Estadísticas de presupuesto general calculadas exitosamente.',
        datos: {
            presupuestoTotal: Math.round(presupuestoGeneral * 100) / 100,
            totalNotas,
            promedioPorNota,
            conteosPorEstado,
        },
    };
}
