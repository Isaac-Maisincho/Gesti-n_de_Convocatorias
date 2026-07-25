import { Card, LinkButton, formatUSD } from "@/components/ui";
import { obtenerResumen } from "@/lib/repositories/resumen";
import { EstadoNota } from "@/lib/types";

export const dynamic = "force-dynamic";

const estadoLabels: Record<EstadoNota, string> = {
  registrada: "Registradas",
  en_revision: "En revisión",
  aprobada: "Aprobadas",
  rechazada: "Rechazadas",
};

export default async function DashboardPage() {
  const resumen = await obtenerResumen();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel general</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestión de convocatorias de notas conceptuales orientadas a sostenibilidad
          territorial e impacto social.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Convocatorias" value={resumen.totalConvocatorias} />
        <StatCard label="Directores registrados" value={resumen.totalDirectores} />
        <StatCard label="Notas conceptuales" value={resumen.totalNotas} />
        <StatCard
          label="Presupuesto general solicitado"
          value={formatUSD(resumen.presupuestoGeneralSolicitado)}
          highlight
        />
      </div>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-slate-700">Notas por estado</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Object.entries(estadoLabels).map(([estado, label]) => (
            <div key={estado} className="rounded-lg bg-slate-50 p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">
                {resumen.notasPorEstado[estado as EstadoNota]}
              </div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <LinkButton href="/convocatorias">+ Nueva convocatoria</LinkButton>
        <LinkButton href="/directores" variant="secondary">+ Registrar director</LinkButton>
        <LinkButton href="/notas/nueva" variant="secondary">+ Nueva nota conceptual</LinkButton>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <Card className={`p-5 ${highlight ? "border-teal-200 bg-teal-50" : ""}`}>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-2 text-2xl font-bold ${highlight ? "text-teal-700" : "text-slate-900"}`}>
        {value}
      </div>
    </Card>
  );
}
