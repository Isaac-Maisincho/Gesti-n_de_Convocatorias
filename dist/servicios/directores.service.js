"use strict";
// ============================================================
// Servicio de Directores — Lógica de negocio
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarDirector = registrarDirector;
exports.listarDirectores = listarDirectores;
exports.obtenerDirectorPorId = obtenerDirectorPorId;
const functions_1 = require("../models/functions");
const validaciones_1 = require("./validaciones");
const almacenamiento_1 = require("./almacenamiento");
/**
 * Registra un nuevo director de nota conceptual.
 */
function registrarDirector(datos) {
    const errores = (0, validaciones_1.validarDirector)(datos);
    if (errores.length > 0) {
        return {
            exito: false,
            mensaje: errores.join(' '),
        };
    }
    const nuevo = {
        id: (0, functions_1.generarId)(),
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim().toLowerCase(),
        telefono: datos.telefono.trim(),
    };
    (0, almacenamiento_1.agregarDirector)(nuevo);
    return {
        exito: true,
        mensaje: `Director "${nuevo.nombre}" registrado exitosamente.`,
        datos: nuevo,
    };
}
/**
 * Retorna todos los directores registrados.
 */
function listarDirectores() {
    return {
        exito: true,
        mensaje: 'Directores obtenidos exitosamente.',
        datos: (0, almacenamiento_1.obtenerDirectores)(),
    };
}
/**
 * Busca un director por su ID.
 */
function obtenerDirectorPorId(id) {
    const director = (0, almacenamiento_1.buscarDirectorPorId)(id);
    if (!director) {
        return {
            exito: false,
            mensaje: `No se encontró un director con ID "${id}".`,
        };
    }
    return {
        exito: true,
        mensaje: 'Director encontrado.',
        datos: director,
    };
}
