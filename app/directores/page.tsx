import { Card } from "@/components/ui";
import NuevoDirectorForm from "@/components/forms/NuevoDirectorForm";
import { listarDirectores } from "@/lib/repositories/directores";

export const dynamic = "force-dynamic";

export default async function DirectoresPage() {
  const directores = await listarDirectores();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Directores</h1>
        <p className="mt-1 text-sm text-slate-500">
          Registra a los directores responsables que luego se podrán asignar a una nota conceptual.
        </p>
      </div>

      <NuevoDirectorForm />

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombres</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Cargo</th>
              <th className="px-4 py-3">Institución</th>
              <th className="px-4 py-3">Teléfono</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {directores.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{d.nombres}</td>
                <td className="px-4 py-3 text-slate-600">{d.correo}</td>
                <td className="px-4 py-3 text-slate-600">{d.cargo || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{d.institucion || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{d.telefono || "-"}</td>
              </tr>
            ))}
            {directores.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Aún no hay directores registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
