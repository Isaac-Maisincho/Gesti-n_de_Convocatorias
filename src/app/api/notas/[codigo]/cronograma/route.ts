// ============================================================
// POST /api/notas/[codigo]/cronograma — Agregar actividad al cronograma
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { agregarActividadCronograma } from '@/servicios/notas.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params;
    const datos = await request.json();
    const resultado = agregarActividadCronograma(codigo, datos);

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
