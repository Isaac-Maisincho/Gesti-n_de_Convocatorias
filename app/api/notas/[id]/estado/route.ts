import { NextRequest, NextResponse } from "next/server";
import { cambiarEstadoSchema } from "@/lib/validations";
import { cambiarEstadoNota } from "@/lib/repositories/notas";
import { EstadoNota } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = cambiarEstadoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.issues },
      { status: 400 }
    );
  }

  const nota = await cambiarEstadoNota(id, parsed.data.estado as EstadoNota);

  if (!nota) {
    return NextResponse.json({ error: "Nota conceptual no encontrada." }, { status: 404 });
  }

  return NextResponse.json(nota);
}
