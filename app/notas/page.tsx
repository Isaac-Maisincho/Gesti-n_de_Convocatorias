import Link from "next/link";
import { EstadoBadge, LinkButton, Card, formatUSD, formatFecha } from "@/components/ui";
import FiltrosNotas from "@/components/forms/FiltrosNotas";
import { listarConvocatorias } from "@/lib/repositories/convocatorias";
import { listarNotas } from "@/lib/repositories/notas";
import { calcularTotalPresupuesto } from "@/lib/validations";

interface PageProps {
  searchParams: Promise<{ codigo?: string; estado?: string; convocatoriaId?: string }>;
}

export default async function NotasPage({ searchParams }: PageProps) {
  const filtros = await searchParams;
  const [notas, convocatorias] = await Promise.all([
    listarNotas(filtros),
    listarConvocatorias(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notas conceptuales</h1>
          <p className="mt-1 text-sm text-slate-500">
            Busca por código, filtra por estado o convocatoria, y da seguimiento al presupuesto solicitado.
          </p>
        </div>
        <LinkButton href="/notas/nueva">+ Nueva nota conceptual</LinkButton>
      </div>

      <FiltrosNotas convocatorias={convocatorias} />

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Registro</th>
              <th className="px-4 py-3">Presupuesto</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {notas.map((n) => (
              <tr key={n.id}>
                <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">
                  {n.codigo}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{n.titulo}</td>
                <td className="px-4 py-3 text-slate-600">{formatFecha(n.fechaRegistro)}</td>
                <td className="px-4 py-3 text-slate-600">
                  {formatUSD(calcularTotalPresupuesto(n.itemsPresupuesto))}
                </td>
                <td className="px-4 py-3">
                  <EstadoBadge estado={n.estado} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/notas/${n.id}`} className="text-sm font-semibold text-teal-700 hover:underline">
                    Ver detalle →
                  </Link>
                </td>
              </tr>
            ))}
            {notas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No se encontraron notas conceptuales con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
