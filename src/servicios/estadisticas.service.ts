// ============================================================
// Servicio de Estadísticas — Lógica de negocio
// ============================================================

import type { RespuestaAPI } from '@/models/interfaces';
import { calcularPresupuestoTotal } from '@/models/functions';
import { obtenerNotas } from './almacenamiento';

export interface EstadisticasPresupuesto {
  presupuestoGeneral: number;
  totalNotas: number;
  promedioPresupuestoPorNota: number;
  notasPorEstado: {
    registrada: number;
    'en revisión': number;
    aprobada: number;
    rechazada: number;
  };
}

/**
 * Calcula la sumatoria de todos los presupuestos de las notas registradas
 * y estadísticas adicionales.
 */
export function obtenerPresupuestoGeneral(): RespuestaAPI<EstadisticasPresupuesto> {
  const notas = obtenerNotas();

  const presupuestoGeneral = notas.reduce((suma, nota) => {
    return suma + calcularPresupuestoTotal(nota.presupuesto.items);
  }, 0);

  const totalNotas = notas.length;
  const promedioPresupuestoPorNota =
    totalNotas > 0
      ? Math.round((presupuestoGeneral / totalNotas) * 100) / 100
      : 0;

  const notasPorEstado = {
    registrada: notas.filter((n) => n.estado === 'registrada').length,
    'en revisión': notas.filter((n) => n.estado === 'en revisión').length,
    aprobada: notas.filter((n) => n.estado === 'aprobada').length,
    rechazada: notas.filter((n) => n.estado === 'rechazada').length,
  };

  return {
    exito: true,
    mensaje: 'Estadísticas de presupuesto general calculadas exitosamente.',
    datos: {
      presupuestoGeneral: Math.round(presupuestoGeneral * 100) / 100,
      totalNotas,
      promedioPresupuestoPorNota,
      notasPorEstado,
    },
  };
}
