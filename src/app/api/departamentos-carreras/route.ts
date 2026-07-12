// ============================================================
// GET /api/departamentos-carreras — Departamentos y carreras desde JSON
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import departamentosData from '@/data/departamentos-carreras.json';
import type { Departamento } from '@/models/interfaces';

const departamentos: Departamento[] = departamentosData as Departamento[];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const departamentoId = searchParams.get('departamentoId');

  // Si se provee un departamentoId, retornar solo las carreras de ese departamento
  if (departamentoId) {
    const dep = departamentos.find((d) => d.id === departamentoId);
    if (!dep) {
      return NextResponse.json(
        {
          exito: false,
          mensaje: `No se encontró el departamento con ID "${departamentoId}".`,
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        exito: true,
        mensaje: `Carreras del departamento "${dep.nombre}".`,
        datos: dep,
      },
      { status: 200 }
    );
  }

  // Retornar todos los departamentos con sus carreras
  return NextResponse.json(
    {
      exito: true,
      mensaje: 'Departamentos y carreras obtenidos exitosamente.',
      datos: departamentos,
    },
    { status: 200 }
  );
}
