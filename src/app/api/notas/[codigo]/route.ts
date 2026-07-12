// ============================================================
// GET /api/notas/[codigo] — Obtener nota por código
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { obtenerNotaPorCodigo } from '@/servicios/notas.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  const { codigo } = await params;
  const resultado = obtenerNotaPorCodigo(codigo);

  if (!resultado.exito) {
    return NextResponse.json(resultado, { status: 404 });
  }

  return NextResponse.json(resultado, { status: 200 });
}
