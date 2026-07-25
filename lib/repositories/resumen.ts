import { listarConvocatorias } from "./convocatorias";
import { listarDirectores } from "./directores";
import { listarNotas, totalPresupuestoNota } from "./notas";
import { ESTADOS_NOTA, EstadoNota } from "../types";

export interface Resumen {
  totalConvocatorias: number;
  totalDirectores: number;
  totalNotas: number;
  presupuestoGeneralSolicitado: number;
  notasPorEstado: Record<EstadoNota, number>;
}

export async function obtenerResumen(): Promise<Resumen> {
  const [convocatorias, directores, notas] = await Promise.all([
    listarConvocatorias(),
    listarDirectores(),
    listarNotas(),
  ]);

  const presupuestoGeneralSolicitado = notas.reduce(
    (acc, nota) => acc + totalPresupuestoNota(nota),
    0
  );

  const notasPorEstado = ESTADOS_NOTA.reduce((acc, estado) => {
    acc[estado] = notas.filter((n) => n.estado === estado).length;
    return acc;
  }, {} as Record<EstadoNota, number>);

  return {
    totalConvocatorias: convocatorias.length,
    totalDirectores: directores.length,
    totalNotas: notas.length,
    presupuestoGeneralSolicitado,
    notasPorEstado,
  };
}
