import { readCollection, writeCollection, generarId } from "../db";
import { Director, NuevoDirector } from "../types";

const FILE = "directores.json";

export async function listarDirectores(): Promise<Director[]> {
  const items = await readCollection<Director>(FILE);
  return items.sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
}

export async function obtenerDirector(id: string): Promise<Director | undefined> {
  const items = await readCollection<Director>(FILE);
  return items.find((d) => d.id === id);
}

export async function crearDirector(data: NuevoDirector): Promise<Director> {
  const items = await readCollection<Director>(FILE);
  const nuevo: Director = {
    ...data,
    id: generarId(),
    creadoEn: new Date().toISOString(),
  };
  items.push(nuevo);
  await writeCollection(FILE, items);
  return nuevo;
}
