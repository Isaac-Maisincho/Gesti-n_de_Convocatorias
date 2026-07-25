import { readCollection, writeCollection, generarId } from "../db";
import { EstadoNota, NotaConceptual, NuevaNotaConceptual } from "../types";
import { calcularTotalPresupuesto } from "../validations";

const FILE = "notas.json";

export interface FiltrosNota {
  codigo?: string;
  estado?: string;
  convocatoriaId?: string;
}

async function generarCodigo(): Promise<string> {
  const items = await readCollection<NotaConceptual>(FILE);
  const anio = new Date().getFullYear();
  const prefijo = `NC-${anio}-`;
  const consecutivos = items
    .map((n) => n.codigo)
    .filter((c) => c.startsWith(prefijo))
    .map((c) => parseInt(c.slice(prefijo.length), 10))
    .filter((n) => !Number.isNaN(n));
  const siguiente = (consecutivos.length ? Math.max(...consecutivos) : 0) + 1;
  return `${prefijo}${String(siguiente).padStart(4, "0")}`;
}

export async function listarNotas(filtros: FiltrosNota = {}): Promise<NotaConceptual[]> {
  let items = await readCollection<NotaConceptual>(FILE);

  if (filtros.codigo) {
    const q = filtros.codigo.trim().toLowerCase();
    items = items.filter((n) => n.codigo.toLowerCase().includes(q));
  }
  if (filtros.estado) {
    items = items.filter((n) => n.estado === filtros.estado);
  }
  if (filtros.convocatoriaId) {
    items = items.filter((n) => n.convocatoriaId === filtros.convocatoriaId);
  }

  return items.sort((a, b) => b.creadaEn.localeCompare(a.creadaEn));
}

export async function obtenerNota(id: string): Promise<NotaConceptual | undefined> {
  const items = await readCollection<NotaConceptual>(FILE);
  return items.find((n) => n.id === id);
}

export async function crearNota(data: NuevaNotaConceptual): Promise<NotaConceptual> {
  const items = await readCollection<NotaConceptual>(FILE);
  const now = new Date().toISOString();
  const nueva: NotaConceptual = {
    ...data,
    id: generarId(),
    codigo: await generarCodigo(),
    itemsPresupuesto: data.itemsPresupuesto.map((item) => ({ ...item, id: generarId() })),
    actividades: data.actividades.map((act) => ({ ...act, id: generarId() })),
    estado: "registrada",
    creadaEn: now,
    actualizadaEn: now,
  };
  items.push(nueva);
  await writeCollection(FILE, items);
  return nueva;
}

export async function cambiarEstadoNota(
  id: string,
  estado: EstadoNota
): Promise<NotaConceptual | undefined> {
  const items = await readCollection<NotaConceptual>(FILE);
  const idx = items.findIndex((n) => n.id === id);
  if (idx === -1) return undefined;
  items[idx] = { ...items[idx], estado, actualizadaEn: new Date().toISOString() };
  await writeCollection(FILE, items);
  return items[idx];
}

export function totalPresupuestoNota(nota: NotaConceptual): number {
  return calcularTotalPresupuesto(nota.itemsPresupuesto);
}

export async function totalPresupuestoGeneral(): Promise<number> {
  const items = await readCollection<NotaConceptual>(FILE);
  return items.reduce((acc, nota) => acc + totalPresupuestoNota(nota), 0);
}
