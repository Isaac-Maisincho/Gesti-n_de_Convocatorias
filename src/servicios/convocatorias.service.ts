// ============================================================
// Servicio de Convocatorias — Lógica de negocio
// ============================================================

import type { Convocatoria, RespuestaAPI } from '@/models/interfaces';
import { generarId, fechaActual } from '@/models/functions';
import { validarConvocatoria } from './validaciones';
import {
  agregarConvocatoria,
  obtenerConvocatorias,
} from './almacenamiento';

/**
 * Crea una nueva convocatoria validando los datos de entrada.
 */
export function crearConvocatoria(
  datos: Partial<Convocatoria>
): RespuestaAPI<Convocatoria> {
  const errores = validarConvocatoria(datos);

  if (errores.length > 0) {
    return {
      exito: false,
      mensaje: errores.join(' '),
    };
  }

  const nueva: Convocatoria = {
    id: generarId(),
    anio: datos.anio!,
    estado: datos.estado ?? 'activa',
  };

  agregarConvocatoria(nueva);

  return {
    exito: true,
    mensaje: `Convocatoria ${nueva.anio} creada exitosamente.`,
    datos: nueva,
  };
}

/**
 * Retorna todas las convocatorias registradas.
 */
export function listarConvocatorias(): RespuestaAPI<Convocatoria[]> {
  return {
    exito: true,
    mensaje: 'Convocatorias obtenidas exitosamente.',
    datos: obtenerConvocatorias(),
  };
}
