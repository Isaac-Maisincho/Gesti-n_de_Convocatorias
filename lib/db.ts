import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureFile(fileName: string) {
  const filePath = path.join(DATA_DIR, fileName);
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, "[]", "utf-8");
  }
  return filePath;
}

export async function readCollection<T>(fileName: string): Promise<T[]> {
  const filePath = await ensureFile(fileName);
  const raw = await fs.readFile(filePath, "utf-8");
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export async function writeCollection<T>(fileName: string, data: T[]): Promise<void> {
  const filePath = await ensureFile(fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function generarId(): string {
  return randomUUID();
}
