import { NextResponse } from "next/server";
import { obtenerNota } from "@/lib/repositories/notas";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const nota = await obtenerNota(id);

  if (!nota) {
    return NextResponse.json({ error: "Nota conceptual no encontrada." }, { status: 404 });
  }

  return NextResponse.json(nota);
}
