import { Card, formatFecha } from "@/components/ui";
import NuevaConvocatoriaForm from "@/components/forms/NuevaConvocatoriaForm";
import { listarConvocatorias } from "@/lib/repositories/convocatorias";

export const dynamic = "force-dynamic";

export default async function ConvocatoriasPage() {
  const convocatorias = await listarConvocatorias();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Convocatorias</h1>
        <p className="mt-1 text-sm text-slate-500">
          Crea y administra las convocatorias bajo las cuales se registran las notas conceptuales.
        </p>
      </div>

      <NuevaConvocatoriaForm />

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Apertura</th>
              <th className="px-4 py-3">Cierre</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Descripción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {convocatorias.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{c.nombre}</td>
                <td className="px-4 py-3 text-slate-600">{formatFecha(c.fechaApertura)}</td>
                <td className="px-4 py-3 text-slate-600">{formatFecha(c.fechaCierre)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      c.estado === "abierta"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {c.estado === "abierta" ? "Abierta" : "Cerrada"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{c.descripcion || "-"}</td>
              </tr>
            ))}
            {convocatorias.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Aún no hay convocatorias registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
