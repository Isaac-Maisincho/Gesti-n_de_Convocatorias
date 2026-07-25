import { NextRequest, NextResponse } from "next/server";
import { directorSchema } from "@/lib/validations";
import { crearDirector, listarDirectores } from "@/lib/repositories/directores";

export async function GET() {
  const directores = await listarDirectores();
  return NextResponse.json(directores);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = directorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.issues },
      { status: 400 }
    );
  }

  const director = await crearDirector(parsed.data);
  return NextResponse.json(director, { status: 201 });
}
