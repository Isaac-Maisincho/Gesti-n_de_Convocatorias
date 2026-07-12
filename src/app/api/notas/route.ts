// ============================================================
// POST /api/notas   — Crear nota conceptual
// GET  /api/notas   — Listar notas (paginado)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { crearNota, listarNotas } from '@/servicios/notas.service';

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();
    const resultado = crearNota(datos);

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pagina = parseInt(searchParams.get('pagina') ?? '1', 10);
  const limite = parseInt(searchParams.get('limite') ?? '3', 10);

  const resultado = listarNotas({
    pagina: isNaN(pagina) ? 1 : pagina,
    limite: isNaN(limite) ? 3 : Math.min(limite, 50), // máximo 50 por página
  });

  return NextResponse.json(resultado, { status: 200 });
}
