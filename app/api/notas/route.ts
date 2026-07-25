import { NextRequest, NextResponse } from "next/server";
import { notaConceptualSchema } from "@/lib/validations";
import { crearNota, listarNotas } from "@/lib/repositories/notas";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const notas = await listarNotas({
    codigo: searchParams.get("codigo") ?? undefined,
    estado: searchParams.get("estado") ?? undefined,
    convocatoriaId: searchParams.get("convocatoriaId") ?? undefined,
  });
  return NextResponse.json(notas);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = notaConceptualSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.issues },
      { status: 400 }
    );
  }

  const nota = await crearNota(parsed.data);
  return NextResponse.json(nota, { status: 201 });
}
