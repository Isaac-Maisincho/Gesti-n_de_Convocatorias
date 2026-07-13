"use strict";
// ============================================================
// Servicio de Notas Conceptuales — Lógica de negocio
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearNota = crearNota;
exports.listarNotas = listarNotas;
exports.obtenerNotaPorCodigo = obtenerNotaPorCodigo;
exports.agregarItemPresupuesto = agregarItemPresupuesto;
exports.agregarActividadCronograma = agregarActividadCronograma;
exports.obtenerPresupuestoTotal = obtenerPresupuestoTotal;
exports.cambiarEstadoNota = cambiarEstadoNota;
exports.actualizarNotaParcial = actualizarNotaParcial;
const functions_1 = require("../models/functions");
const validaciones_1 = require("./validaciones");
const almacenamiento_1 = require("./almacenamiento");
// ── Crear Nota Conceptual ────────────────────────────────────
function crearNota(datos) {
    const errores = (0, validaciones_1.validarNotaConceptual)(datos);
    if (errores.length > 0) {
        return { exito: false, mensaje: errores.join(' ') };
    }
    // Verificar que la convocatoria exista
    if (datos.convocatoriaId) {
        const conv = (0, almacenamiento_1.buscarConvocatoriaPorId)(datos.convocatoriaId);
        if (!conv) {
            return {
                exito: false,
                mensaje: `No se encontró la convocatoria con ID "${datos.convocatoriaId}".`,
            };
        }
    }
    // Verificar que el director exista
    if (datos.directorId) {
        const dir = (0, almacenamiento_1.buscarDirectorPorId)(datos.directorId);
        if (!dir) {
            return {
                exito: false,
                mensaje: `No se encontró el director con ID "${datos.directorId}".`,
            };
        }
    }
    const ahora = (0, functions_1.fechaActual)();
    const anioActual = new Date().getFullYear();
    const nueva = {
        codigo: (0, functions_1.generarCodigoNota)(anioActual),
        convocatoriaId: datos.convocatoriaId,
        // Datos generales
        nombreProyecto: datos.nombreProyecto.trim(),
        sedeUnidadAcademica: datos.sedeUnidadAcademica ?? '',
        departamento: datos.departamento ?? '',
        plazoEjecucion: datos.plazoEjecucion ?? {
            fechaInicio: ahora,
            fechaFin: ahora,
        },
        directorId: datos.directorId,
        // Secciones
        localizacion: datos.localizacion ?? {
            cobertura: 'Nacional',
            detalleUbicacion: '',
        },
        sectorPoblacion: datos.sectorPoblacion ?? {
            urbanoMarginal: false,
            rural: false,
            grupoAtencionPrioritaria: false,
        },
        alineamiento: datos.alineamiento ?? {
            ambitosPrioritarios: [],
            objetivosODS2030: [],
            camposCineUnesco: [],
            objetivosPND: [],
            objetivosGAD: [],
            objetivosPlanEstrategico: [],
            lineasInvestigacion: [],
            dominioAcademico: [],
        },
        departamentosParticipantes: datos.departamentosParticipantes ?? [],
        carrerasParticipantes: datos.carrerasParticipantes ?? [],
        impactosEsperados: datos.impactosEsperados ?? {
            economico: '',
            social: '',
            politico: '',
            cientifico: '',
            ambiental: '',
            otros: '',
        },
        caracterizacionPoblacion: datos.caracterizacionPoblacion ?? {
            poblacionReferencia: 0,
            poblacionPotencial: 0,
            poblacionObjetivo: 0,
        },
        presupuesto: datos.presupuesto ?? {
            items: [],
            aporteEntidadAuspiciante: 0,
        },
        cronograma: datos.cronograma ?? [],
        firmasResponsabilidad: datos.firmasResponsabilidad ?? {
            directorNota: '',
            directorCarrera: '',
            coordinadorVinculacion: '',
            directorDepartamento: '',
        },
        // Estado
        estado: 'registrada',
        creadoEn: ahora,
        actualizadoEn: ahora,
    };
    (0, almacenamiento_1.agregarNota)(nueva);
    return {
        exito: true,
        mensaje: `Nota conceptual "${nueva.codigo}" creada exitosamente.`,
        datos: nueva,
    };
}
// ── Listar Notas (paginado) ──────────────────────────────────
function listarNotas(params) {
    const todas = (0, almacenamiento_1.obtenerNotas)();
    const resultado = (0, functions_1.paginar)(todas, params);
    return {
        exito: true,
        mensaje: 'Notas conceptuales obtenidas exitosamente.',
        datos: resultado,
    };
}
// ── Obtener Nota por Código ──────────────────────────────────
function obtenerNotaPorCodigo(codigo) {
    const nota = (0, almacenamiento_1.buscarNotaPorCodigo)(codigo);
    if (!nota) {
        return {
            exito: false,
            mensaje: `No se encontró la nota con código "${codigo}".`,
        };
    }
    return {
        exito: true,
        mensaje: 'Nota conceptual encontrada.',
        datos: nota,
    };
}
// ── Agregar Ítem de Presupuesto ──────────────────────────────
function agregarItemPresupuesto(codigo, item) {
    const nota = (0, almacenamiento_1.buscarNotaPorCodigo)(codigo);
    if (!nota) {
        return {
            exito: false,
            mensaje: `No se encontró la nota con código "${codigo}".`,
        };
    }
    const errores = (0, validaciones_1.validarItemPresupuesto)(item);
    if (errores.length > 0) {
        return { exito: false, mensaje: errores.join(' ') };
    }
    const nuevoItem = {
        id: (0, functions_1.generarId)(),
        descripcion: item.descripcion.trim(),
        cantidad: item.cantidad,
        valorUnitario: item.valorUnitario,
        total: (0, functions_1.calcularTotalItem)(item.cantidad, item.valorUnitario),
    };
    // Validar que no se exceda el límite con el nuevo ítem
    const erroresLimite = (0, validaciones_1.validarLimitePresupuesto)(nota.presupuesto.items, nuevoItem);
    if (erroresLimite.length > 0) {
        return { exito: false, mensaje: erroresLimite.join(' ') };
    }
    nota.presupuesto.items.push(nuevoItem);
    nota.actualizadoEn = (0, functions_1.fechaActual)();
    (0, almacenamiento_1.actualizarNota)(codigo, nota);
    return {
        exito: true,
        mensaje: `Ítem presupuestario agregado a la nota "${codigo}".`,
        datos: nuevoItem,
    };
}
// ── Agregar Actividad al Cronograma ──────────────────────────
function agregarActividadCronograma(codigo, actividad) {
    const nota = (0, almacenamiento_1.buscarNotaPorCodigo)(codigo);
    if (!nota) {
        return {
            exito: false,
            mensaje: `No se encontró la nota con código "${codigo}".`,
        };
    }
    const errores = (0, validaciones_1.validarActividad)(actividad);
    if (errores.length > 0) {
        return { exito: false, mensaje: errores.join(' ') };
    }
    const nueva = {
        id: (0, functions_1.generarId)(),
        descripcion: actividad.descripcion.trim(),
        fechaInicio: actividad.fechaInicio,
        fechaFin: actividad.fechaFin,
        responsable: actividad.responsable?.trim() ?? '',
    };
    nota.cronograma.push(nueva);
    nota.actualizadoEn = (0, functions_1.fechaActual)();
    (0, almacenamiento_1.actualizarNota)(codigo, nota);
    return {
        exito: true,
        mensaje: `Actividad agregada al cronograma de la nota "${codigo}".`,
        datos: nueva,
    };
}
// ── Obtener Presupuesto Total de una Nota ────────────────────
function obtenerPresupuestoTotal(codigo) {
    const nota = (0, almacenamiento_1.buscarNotaPorCodigo)(codigo);
    if (!nota) {
        return {
            exito: false,
            mensaje: `No se encontró la nota con código "${codigo}".`,
        };
    }
    const costoTotal = (0, functions_1.calcularPresupuestoTotal)(nota.presupuesto.items);
    return {
        exito: true,
        mensaje: `Presupuesto total de la nota "${codigo}".`,
        datos: {
            costoTotal,
            cantidadItems: nota.presupuesto.items.length,
            aporteAuspiciante: nota.presupuesto.aporteEntidadAuspiciante,
        },
    };
}
// ── Cambiar Estado de la Nota ────────────────────────────────
function cambiarEstadoNota(codigo, nuevoEstado) {
    const nota = (0, almacenamiento_1.buscarNotaPorCodigo)(codigo);
    if (!nota) {
        return {
            exito: false,
            mensaje: `No se encontró la nota con código "${codigo}".`,
        };
    }
    const errores = (0, validaciones_1.validarCambioEstado)(nuevoEstado);
    if (errores.length > 0) {
        return { exito: false, mensaje: errores.join(' ') };
    }
    const estadoAnterior = nota.estado;
    nota.estado = nuevoEstado;
    nota.actualizadoEn = (0, functions_1.fechaActual)();
    (0, almacenamiento_1.actualizarNota)(codigo, nota);
    return {
        exito: true,
        mensaje: `Estado de la nota "${codigo}" actualizado de "${estadoAnterior}" a "${nuevoEstado}".`,
        datos: {
            estadoAnterior,
            estadoNuevo: nuevoEstado,
        },
    };
}
function actualizarNotaParcial(codigo, datos) {
    const nota = (0, almacenamiento_1.buscarNotaPorCodigo)(codigo);
    if (!nota) {
        return {
            exito: false,
            mensaje: `No se encontró la nota con código "${codigo}".`,
        };
    }
    const errores = [];
    if (datos.nombreProyecto !== undefined && !(0, functions_1.noVacio)(datos.nombreProyecto)) {
        errores.push('El nombre del proyecto no debe estar vacío.');
    }
    if (datos.caracterizacionPoblacion) {
        const { poblacionReferencia, poblacionObjetivo } = datos.caracterizacionPoblacion;
        if (typeof poblacionObjetivo === 'number' &&
            typeof poblacionReferencia === 'number' &&
            poblacionObjetivo > poblacionReferencia) {
            errores.push('La Población Objetivo no puede ser mayor que la Población de Referencia.');
        }
    }
    if (datos.presupuesto?.items) {
        datos.presupuesto.items.forEach((item, i) => {
            if (typeof item.cantidad !== 'number' || item.cantidad <= 0) {
                errores.push(`Ítem presupuestario #${i + 1}: la cantidad debe ser mayor que cero.`);
            }
            if (typeof item.valorUnitario !== 'number' || item.valorUnitario < 0) {
                errores.push(`Ítem presupuestario #${i + 1}: el valor unitario no puede ser negativo.`);
            }
        });
        const total = (0, functions_1.calcularPresupuestoTotal)(datos.presupuesto.items.map((item) => ({ total: (0, functions_1.calcularTotalItem)(item.cantidad ?? 0, item.valorUnitario ?? 0) })));
        if (total > functions_1.LIMITE_PRESUPUESTO_USD) {
            errores.push(`El costo total del presupuesto (USD ${total.toFixed(2)}) supera el límite de USD ${functions_1.LIMITE_PRESUPUESTO_USD.toLocaleString()}.`);
        }
    }
    if (datos.cronograma && datos.cronograma.length < 1) {
        errores.push('La nota debe tener al menos una actividad registrada en su cronograma.');
    }
    if (datos.estado !== undefined) {
        const estadoErrores = (0, validaciones_1.validarCambioEstado)(datos.estado);
        errores.push(...estadoErrores);
    }
    if (errores.length > 0) {
        return { exito: false, mensaje: errores.join(' ') };
    }
    const actualizado = {
        ...nota,
        ...datos,
        actualizadoEn: (0, functions_1.fechaActual)(),
    };
    (0, almacenamiento_1.actualizarNota)(codigo, actualizado);
    return {
        exito: true,
        mensaje: `Nota "${codigo}" actualizada exitosamente.`,
        datos: actualizado,
    };
}
