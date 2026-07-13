"use strict";
// ============================================================
// Servicio de Convocatorias — Lógica de negocio
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearConvocatoria = crearConvocatoria;
exports.listarConvocatorias = listarConvocatorias;
const functions_1 = require("../models/functions");
const validaciones_1 = require("./validaciones");
const almacenamiento_1 = require("./almacenamiento");
/**
 * Crea una nueva convocatoria validando los datos de entrada.
 */
function crearConvocatoria(datos) {
    const errores = (0, validaciones_1.validarConvocatoria)(datos);
    if (errores.length > 0) {
        return {
            exito: false,
            mensaje: errores.join(' '),
        };
    }
    const nueva = {
        id: (0, functions_1.generarId)(),
        anio: datos.anio,
        estado: datos.estado ?? 'activa',
    };
    (0, almacenamiento_1.agregarConvocatoria)(nueva);
    return {
        exito: true,
        mensaje: `Convocatoria ${nueva.anio} creada exitosamente.`,
        datos: nueva,
    };
}
/**
 * Retorna todas las convocatorias registradas.
 */
function listarConvocatorias() {
    return {
        exito: true,
        mensaje: 'Convocatorias obtenidas exitosamente.',
        datos: (0, almacenamiento_1.obtenerConvocatorias)(),
    };
}
