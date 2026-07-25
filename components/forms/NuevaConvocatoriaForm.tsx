"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { EstadoConvocatoria } from "@/lib/types";

const initialForm = {
  nombre: "",
  fechaApertura: "",
  fechaCierre: "",
  estado: "abierta" as EstadoConvocatoria,
  descripcion: "",
};

export default function NuevaConvocatoriaForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const res = await fetch("/api/convocatorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      const fieldErrors: Record<string, string> = {};
      for (const issue of data.detalles ?? []) {
        fieldErrors[issue.path[0]] = issue.message;
      }
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    setForm(initialForm);
    setLoading(false);
    router.refresh();
  }

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">Nueva convocatoria</h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="nombre" error={errors.nombre}>
          <Input
            id="nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
        </Field>
        <Field label="Estado" htmlFor="estado">
          <Select
            id="estado"
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoConvocatoria })}
          >
            <option value="abierta">Abierta</option>
            <option value="cerrada">Cerrada</option>
          </Select>
        </Field>
        <Field label="Fecha de apertura" htmlFor="fechaApertura" error={errors.fechaApertura}>
          <Input
            id="fechaApertura"
            type="date"
            value={form.fechaApertura}
            onChange={(e) => setForm({ ...form, fechaApertura: e.target.value })}
          />
        </Field>
        <Field label="Fecha de cierre" htmlFor="fechaCierre" error={errors.fechaCierre}>
          <Input
            id="fechaCierre"
            type="date"
            value={form.fechaCierre}
            onChange={(e) => setForm({ ...form, fechaCierre: e.target.value })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Descripción" htmlFor="descripcion">
            <Textarea
              id="descripcion"
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Crear convocatoria"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
