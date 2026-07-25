import { NextResponse } from "next/server";
import { obtenerResumen } from "@/lib/repositories/resumen";

export async function GET() {
  const resumen = await obtenerResumen();
  return NextResponse.json(resumen);
}
