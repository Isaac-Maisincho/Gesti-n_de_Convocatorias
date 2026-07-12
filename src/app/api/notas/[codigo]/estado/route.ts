// ============================================================
// PATCH /api/notas/[codigo]/estado — Cambiar estado de la nota
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { cambiarEstadoNota } from '@/servicios/notas.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params;
    const { estado } = await request.json();
    const resultado = cambiarEstadoNota(codigo, estado);

    if (!resultado.exito) {
      return NextResponse.json(resultado, { status: 400 });
    }

    return NextResponse.json(resultado, { status: 200 });
  } catch {
    return NextResponse.json(
      { exito: false, mensaje: 'Error al procesar la solicitud. Verifique el formato JSON.' },
      { status: 400 }
    );
  }
}
