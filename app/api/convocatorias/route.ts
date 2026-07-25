import { NextRequest, NextResponse } from "next/server";
import { convocatoriaSchema } from "@/lib/validations";
import { crearConvocatoria, listarConvocatorias } from "@/lib/repositories/convocatorias";

export async function GET() {
  const convocatorias = await listarConvocatorias();
  return NextResponse.json(convocatorias);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = convocatoriaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.issues },
      { status: 400 }
    );
  }

  const convocatoria = await crearConvocatoria(parsed.data);
  return NextResponse.json(convocatoria, { status: 201 });
}
