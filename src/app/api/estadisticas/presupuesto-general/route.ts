// ============================================================
// GET /api/estadisticas/presupuesto-general — Sumatoria global
// ============================================================

import { NextResponse } from 'next/server';
import { obtenerPresupuestoGeneral } from '@/servicios/estadisticas.service';

export async function GET() {
  const resultado = obtenerPresupuestoGeneral();
  return NextResponse.json(resultado, { status: 200 });
}
