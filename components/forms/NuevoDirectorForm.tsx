"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input } from "@/components/ui";

const initialForm = {
  nombres: "",
  correo: "",
  cargo: "",
  institucion: "",
  telefono: "",
};

export default function NuevoDirectorForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const res = await fetch("/api/directores", {
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
      <h2 className="mb-4 text-sm font-semibold text-slate-700">Nuevo director</h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nombres" htmlFor="nombres" error={errors.nombres}>
          <Input
            id="nombres"
            value={form.nombres}
            onChange={(e) => setForm({ ...form, nombres: e.target.value })}
          />
        </Field>
        <Field label="Correo" htmlFor="correo" error={errors.correo} hint="Debe contener '@'.">
          <Input
            id="correo"
            type="text"
            value={form.correo}
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
          />
        </Field>
        <Field label="Cargo" htmlFor="cargo">
          <Input
            id="cargo"
            value={form.cargo}
            onChange={(e) => setForm({ ...form, cargo: e.target.value })}
          />
        </Field>
        <Field label="Institución" htmlFor="institucion">
          <Input
            id="institucion"
            value={form.institucion}
            onChange={(e) => setForm({ ...form, institucion: e.target.value })}
          />
        </Field>
        <Field label="Teléfono" htmlFor="telefono">
          <Input
            id="telefono"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Registrar director"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
