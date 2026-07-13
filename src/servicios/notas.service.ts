// ============================================================
// Servicio de Notas Conceptuales — Lógica de negocio
// ============================================================

import type {
  NotaConceptual,
  RespuestaAPI,
  RespuestaPaginada,
  PaginacionParams,
  ItemPresupuesto,
  ActividadCronograma,
  EstadoNota,
} from '@/models/interfaces';
import {
  generarId,
  generarCodigoNota,
  fechaActual,
  calcularTotalItem,
  calcularPresupuestoTotal,
  paginar,
  noVacio,
  LIMITE_PRESUPUESTO_USD,
} from '@/models/functions';
import {
  validarNotaConceptual,
  validarItemPresupuesto,
  validarActividad,
  validarCambioEstado,
  validarLimitePresupuesto,
} from './validaciones';
import {
  agregarNota,
  obtenerNotas,
  buscarNotaPorCodigo,
  actualizarNota,
  buscarConvocatoriaPorId,
  buscarDirectorPorId,
} from './almacenamiento';

// ── Crear Nota Conceptual ────────────────────────────────────
export function crearNota(
  datos: Partial<NotaConceptual>
): RespuestaAPI<NotaConceptual> {
  const errores = validarNotaConceptual(datos);

  if (errores.length > 0) {
    return { exito: false, mensaje: errores.join(' ') };
  }

  // Verificar que la convocatoria exista
  if (datos.convocatoriaId) {
    const conv = buscarConvocatoriaPorId(datos.convocatoriaId);
    if (!conv) {
      return {
        exito: false,
        mensaje: `No se encontró la convocatoria con ID "${datos.convocatoriaId}".`,
      };
    }
  }

  // Verificar que el director exista
  if (datos.directorId) {
    const dir = buscarDirectorPorId(datos.directorId);
    if (!dir) {
      return {
        exito: false,
        mensaje: `No se encontró el director con ID "${datos.directorId}".`,
      };
    }
  }

  const ahora = fechaActual();
  const anioActual = new Date().getFullYear();

  const nueva: NotaConceptual = {
    codigo: generarCodigoNota(anioActual),
    convocatoriaId: datos.convocatoriaId!,

    // Datos generales
    nombreProyecto: datos.nombreProyecto!.trim(),
    sedeUnidadAcademica: datos.sedeUnidadAcademica ?? '',
    departamento: datos.departamento ?? '',
    plazoEjecucion: datos.plazoEjecucion ?? {
      fechaInicio: ahora,
      fechaFin: ahora,
    },
    directorId: datos.directorId!,

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

  agregarNota(nueva);

  return {
    exito: true,
    mensaje: `Nota conceptual "${nueva.codigo}" creada exitosamente.`,
    datos: nueva,
  };
}

// ── Listar Notas (paginado) ──────────────────────────────────
export function listarNotas(
  params: PaginacionParams
): RespuestaAPI<RespuestaPaginada<NotaConceptual>> {
  const todas = obtenerNotas();
  const resultado = paginar(todas, params);

  return {
    exito: true,
    mensaje: 'Notas conceptuales obtenidas exitosamente.',
    datos: resultado,
  };
}

// ── Obtener Nota por Código ──────────────────────────────────
export function obtenerNotaPorCodigo(
  codigo: string
): RespuestaAPI<NotaConceptual> {
  const nota = buscarNotaPorCodigo(codigo);

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
export function agregarItemPresupuesto(
  codigo: string,
  item: Partial<ItemPresupuesto>
): RespuestaAPI<ItemPresupuesto> {
  const nota = buscarNotaPorCodigo(codigo);
  if (!nota) {
    return {
      exito: false,
      mensaje: `No se encontró la nota con código "${codigo}".`,
    };
  }

  const errores = validarItemPresupuesto(item);
  if (errores.length > 0) {
    return { exito: false, mensaje: errores.join(' ') };
  }

  const nuevoItem: ItemPresupuesto = {
    id: generarId(),
    descripcion: item.descripcion!.trim(),
    cantidad: item.cantidad!,
    valorUnitario: item.valorUnitario!,
    total: calcularTotalItem(item.cantidad!, item.valorUnitario!),
  };

  // Validar que no se exceda el límite con el nuevo ítem
  const erroresLimite = validarLimitePresupuesto(
    nota.presupuesto.items,
    nuevoItem
  );
  if (erroresLimite.length > 0) {
    return { exito: false, mensaje: erroresLimite.join(' ') };
  }

  nota.presupuesto.items.push(nuevoItem);
  nota.actualizadoEn = fechaActual();
  actualizarNota(codigo, nota);

  return {
    exito: true,
    mensaje: `Ítem presupuestario agregado a la nota "${codigo}".`,
    datos: nuevoItem,
  };
}

// ── Agregar Actividad al Cronograma ──────────────────────────
export function agregarActividadCronograma(
  codigo: string,
  actividad: Partial<ActividadCronograma>
): RespuestaAPI<ActividadCronograma> {
  const nota = buscarNotaPorCodigo(codigo);
  if (!nota) {
    return {
      exito: false,
      mensaje: `No se encontró la nota con código "${codigo}".`,
    };
  }

  const errores = validarActividad(actividad);
  if (errores.length > 0) {
    return { exito: false, mensaje: errores.join(' ') };
  }

  const nueva: ActividadCronograma = {
    id: generarId(),
    descripcion: actividad.descripcion!.trim(),
    fechaInicio: actividad.fechaInicio!,
    fechaFin: actividad.fechaFin!,
    responsable: actividad.responsable?.trim() ?? '',
  };

  nota.cronograma.push(nueva);
  nota.actualizadoEn = fechaActual();
  actualizarNota(codigo, nota);

  return {
    exito: true,
    mensaje: `Actividad agregada al cronograma de la nota "${codigo}".`,
    datos: nueva,
  };
}

// ── Obtener Presupuesto Total de una Nota ────────────────────
export function obtenerPresupuestoTotal(
  codigo: string
): RespuestaAPI<{ costoTotal: number; cantidadItems: number; aporteAuspiciante: number }> {
  const nota = buscarNotaPorCodigo(codigo);
  if (!nota) {
    return {
      exito: false,
      mensaje: `No se encontró la nota con código "${codigo}".`,
    };
  }

  const costoTotal = calcularPresupuestoTotal(nota.presupuesto.items);

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
export function cambiarEstadoNota(
  codigo: string,
  nuevoEstado: string
): RespuestaAPI<{ estadoAnterior: EstadoNota; estadoNuevo: EstadoNota }> {
  const nota = buscarNotaPorCodigo(codigo);
  if (!nota) {
    return {
      exito: false,
      mensaje: `No se encontró la nota con código "${codigo}".`,
    };
  }

  const errores = validarCambioEstado(nuevoEstado);
  if (errores.length > 0) {
    return { exito: false, mensaje: errores.join(' ') };
  }

  const estadoAnterior = nota.estado;
  nota.estado = nuevoEstado as EstadoNota;
  nota.actualizadoEn = fechaActual();
  actualizarNota(codigo, nota);

  return {
    exito: true,
    mensaje: `Estado de la nota "${codigo}" actualizado de "${estadoAnterior}" a "${nuevoEstado}".`,
    datos: {
      estadoAnterior,
      estadoNuevo: nuevoEstado as EstadoNota,
    },
  };
}

export function actualizarNotaParcial(
  codigo: string,
  datos: Partial<NotaConceptual>
): RespuestaAPI<NotaConceptual> {
  const nota = buscarNotaPorCodigo(codigo);
  if (!nota) {
    return {
      exito: false,
      mensaje: `No se encontró la nota con código "${codigo}".`,
    };
  }

  const errores: string[] = [];

  if (datos.nombreProyecto !== undefined && !noVacio(datos.nombreProyecto)) {
    errores.push('El nombre del proyecto no debe estar vacío.');
  }

  if (datos.caracterizacionPoblacion) {
    const { poblacionReferencia, poblacionObjetivo } = datos.caracterizacionPoblacion;
    if (
      typeof poblacionObjetivo === 'number' &&
      typeof poblacionReferencia === 'number' &&
      poblacionObjetivo > poblacionReferencia
    ) {
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

    const total = calcularPresupuestoTotal(datos.presupuesto.items.map((item) => ({ total: calcularTotalItem(item.cantidad ?? 0, item.valorUnitario ?? 0) })));
    if (total > LIMITE_PRESUPUESTO_USD) {
      errores.push(
        `El costo total del presupuesto (USD ${total.toFixed(2)}) supera el límite de USD ${LIMITE_PRESUPUESTO_USD.toLocaleString()}.`
      );
    }
  }

  if (datos.cronograma && datos.cronograma.length < 1) {
    errores.push('La nota debe tener al menos una actividad registrada en su cronograma.');
  }

  if (datos.estado !== undefined) {
    const estadoErrores = validarCambioEstado(datos.estado);
    errores.push(...estadoErrores);
  }

  if (errores.length > 0) {
    return { exito: false, mensaje: errores.join(' ') };
  }

  const actualizado = {
    ...nota,
    ...datos,
    actualizadoEn: fechaActual(),
  };

  actualizarNota(codigo, actualizado);

  return {
    exito: true,
    mensaje: `Nota "${codigo}" actualizada exitosamente.`,
    datos: actualizado,
  };
}
