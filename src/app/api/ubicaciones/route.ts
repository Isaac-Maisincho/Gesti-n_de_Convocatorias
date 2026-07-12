// ============================================================
// GET /api/ubicaciones — Provincias, cantones y parroquias (cascada)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import ubicacionesData from '@/data/ubicaciones.json';
import type { Provincia } from '@/models/interfaces';

const provincias: Provincia[] = ubicacionesData as Provincia[];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provinciaId = searchParams.get('provinciaId');
  const cantonId = searchParams.get('cantonId');

  // Nivel 3: Parroquias de un cantón específico
  if (provinciaId && cantonId) {
    const prov = provincias.find((p) => p.id === provinciaId);
    if (!prov) {
      return NextResponse.json(
        { exito: false, mensaje: `Provincia "${provinciaId}" no encontrada.` },
        { status: 404 }
      );
    }
    const canton = prov.cantones.find((c) => c.id === cantonId);
    if (!canton) {
      return NextResponse.json(
        { exito: false, mensaje: `Cantón "${cantonId}" no encontrado en la provincia "${prov.nombre}".` },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        exito: true,
        mensaje: `Parroquias del cantón "${canton.nombre}", provincia "${prov.nombre}".`,
        datos: { provincia: prov.nombre, canton: canton.nombre, parroquias: canton.parroquias },
      },
      { status: 200 }
    );
  }

  // Nivel 2: Cantones de una provincia específica
  if (provinciaId) {
    const prov = provincias.find((p) => p.id === provinciaId);
    if (!prov) {
      return NextResponse.json(
        { exito: false, mensaje: `Provincia "${provinciaId}" no encontrada.` },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        exito: true,
        mensaje: `Cantones de la provincia "${prov.nombre}".`,
        datos: {
          provincia: prov.nombre,
          cantones: prov.cantones.map((c) => ({ id: c.id, nombre: c.nombre })),
        },
      },
      { status: 200 }
    );
  }

  // Nivel 1: Todas las provincias
  return NextResponse.json(
    {
      exito: true,
      mensaje: 'Provincias obtenidas exitosamente.',
      datos: provincias.map((p) => ({ id: p.id, nombre: p.nombre })),
    },
    { status: 200 }
  );
}
