"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Select, Card } from "@/components/ui";
import { Convocatoria, ESTADOS_NOTA } from "@/lib/types";

export default function FiltrosNotas({ convocatorias }: { convocatorias: Convocatoria[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [codigo, setCodigo] = useState(searchParams.get("codigo") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParams(patch: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.replace(`/notas?${params.toString()}`);
  }

  function onCodigoChange(value: string) {
    setCodigo(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParams({ codigo: value }), 300);
  }

  return (
    <Card className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
      <Input
        placeholder="Buscar por código (ej. NC-2026-0001)"
        value={codigo}
        onChange={(e) => onCodigoChange(e.target.value)}
      />
      <Select
        defaultValue={searchParams.get("estado") ?? ""}
        onChange={(e) => updateParams({ estado: e.target.value })}
      >
        <option value="">Todos los estados</option>
        {ESTADOS_NOTA.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </Select>
      <Select
        defaultValue={searchParams.get("convocatoriaId") ?? ""}
        onChange={(e) => updateParams({ convocatoriaId: e.target.value })}
      >
        <option value="">Todas las convocatorias</option>
        {convocatorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </Select>
    </Card>
  );
}
