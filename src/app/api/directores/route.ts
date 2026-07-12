// ============================================================
// POST /api/directores — Registrar director de nota conceptual
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { registrarDirector, listarDirectores } from '@/servicios/directores.service';

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();
    const resultado = registrarDirector(datos);

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
  const resultado = listarDirectores();
  return NextResponse.json(resultado, { status: 200 });
}
