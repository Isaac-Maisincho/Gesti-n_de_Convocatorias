// ============================================================
// GET /api/notas/[codigo]/presupuesto-total — Costo total de la nota
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { obtenerPresupuestoTotal } from '@/servicios/notas.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  const { codigo } = await params;
  const resultado = obtenerPresupuestoTotal(codigo);

  if (!resultado.exito) {
    return NextResponse.json(resultado, { status: 404 });
  }

  return NextResponse.json(resultado, { status: 200 });
}
