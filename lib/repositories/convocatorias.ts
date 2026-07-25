import { readCollection, writeCollection, generarId } from "../db";
import { Convocatoria, NuevaConvocatoria } from "../types";

const FILE = "convocatorias.json";

export async function listarConvocatorias(): Promise<Convocatoria[]> {
  const items = await readCollection<Convocatoria>(FILE);
  return items.sort((a, b) => b.creadaEn.localeCompare(a.creadaEn));
}

export async function obtenerConvocatoria(id: string): Promise<Convocatoria | undefined> {
  const items = await readCollection<Convocatoria>(FILE);
  return items.find((c) => c.id === id);
}

export async function crearConvocatoria(data: NuevaConvocatoria): Promise<Convocatoria> {
  const items = await readCollection<Convocatoria>(FILE);
  const nueva: Convocatoria = {
    ...data,
    id: generarId(),
    creadaEn: new Date().toISOString(),
  };
  items.push(nueva);
  await writeCollection(FILE, items);
  return nueva;
}
