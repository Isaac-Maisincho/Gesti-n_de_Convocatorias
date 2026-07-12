// ============================================================
// POST /api/convocatorias — Inicializar nueva convocatoria
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { crearConvocatoria, listarConvocatorias } from '@/servicios/convocatorias.service';

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();
    const resultado = crearConvocatoria(datos);

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

export async function GET() {
  const resultado = listarConvocatorias();
  return NextResponse.json(resultado, { status: 200 });
}
