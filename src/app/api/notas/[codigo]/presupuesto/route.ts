// ============================================================
// POST /api/notas/[codigo]/presupuesto — Agregar ítem presupuestario
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { agregarItemPresupuesto } from '@/servicios/notas.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params;
    const datos = await request.json();
    const resultado = agregarItemPresupuesto(codigo, datos);

    if (!resultado.exito) {
      return NextResponse.json(resultado, { status: 400 });
    }

    return NextResponse.json(resultado, { status: 201 });
  } catch {
    return NextResponse.json(
      { exito: false, mensaje: 'Error al procesar la solicitud. Verifique el formato JSON.' },
      { status: 400 }
    );
  }
}
