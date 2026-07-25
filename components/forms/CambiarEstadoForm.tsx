"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { ESTADOS_NOTA, EstadoNota } from "@/lib/types";

const estadoLabels: Record<EstadoNota, string> = {
  registrada: "Registrada",
  en_revision: "En revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

export default function CambiarEstadoForm({
  notaId,
  estadoActual,
}: {
  notaId: string;
  estadoActual: EstadoNota;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function cambiarEstado(estado: EstadoNota) {
    setLoading(true);
    const res = await fetch(`/api/notas/${notaId}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <Card className="p-6">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">Cambiar estado</h2>
      <div className="flex flex-wrap gap-2">
        {ESTADOS_NOTA.map((estado) => (
          <Button
            key={estado}
            type="button"
            variant={estado === estadoActual ? "primary" : "secondary"}
            disabled={loading || estado === estadoActual}
            onClick={() => cambiarEstado(estado)}
          >
            {estadoLabels[estado]}
          </Button>
        ))}
      </div>
    </Card>
  );
}
