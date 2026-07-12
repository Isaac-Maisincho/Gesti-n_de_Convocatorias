// ============================================================
// Servicio de Directores — Lógica de negocio
// ============================================================

import type { Director, RespuestaAPI } from '@/models/interfaces';
import { generarId } from '@/models/functions';
import { validarDirector } from './validaciones';
import {
  agregarDirector,
  obtenerDirectores,
  buscarDirectorPorId,
} from './almacenamiento';

/**
 * Registra un nuevo director de nota conceptual.
 */
export function registrarDirector(
  datos: Partial<Director>
): RespuestaAPI<Director> {
  const errores = validarDirector(datos);

  if (errores.length > 0) {
    return {
      exito: false,
      mensaje: errores.join(' '),
    };
  }

  const nuevo: Director = {
    id: generarId(),
    nombre: datos.nombre!.trim(),
    correo: datos.correo!.trim().toLowerCase(),
    telefono: datos.telefono!.trim(),
  };

  agregarDirector(nuevo);

  return {
    exito: true,
    mensaje: `Director "${nuevo.nombre}" registrado exitosamente.`,
    datos: nuevo,
  };
}

/**
 * Retorna todos los directores registrados.
 */
export function listarDirectores(): RespuestaAPI<Director[]> {
  return {
    exito: true,
    mensaje: 'Directores obtenidos exitosamente.',
    datos: obtenerDirectores(),
  };
}

/**
 * Busca un director por su ID.
 */
export function obtenerDirectorPorId(
  id: string
): RespuestaAPI<Director> {
  const director = buscarDirectorPorId(id);

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
