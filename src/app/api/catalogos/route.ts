// ============================================================
// GET /api/catalogos — Catálogos de alineamiento (ODS, CINE-UNESCO, etc.)
// ============================================================

import { NextResponse } from 'next/server';
import catalogosData from '@/data/catalogos.json';

export async function GET() {
  return NextResponse.json(
    {
      exito: true,
      mensaje: 'Catálogos de alineamiento obtenidos exitosamente.',
      datos: catalogosData,
    },
    { status: 200 }
  );
}
