import NuevaNotaForm from "@/components/forms/NuevaNotaForm";
import { listarConvocatorias } from "@/lib/repositories/convocatorias";
import { listarDirectores } from "@/lib/repositories/directores";
import { catalogos, departamentos, provincias, SEDES } from "@/lib/catalogos";

export const dynamic = "force-dynamic";

export default async function NuevaNotaPage() {
  const [convocatorias, directores] = await Promise.all([
    listarConvocatorias(),
    listarDirectores(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Registrar nota conceptual</h1>
        <p className="mt-1 text-sm text-slate-500">
          Completa las secciones según el Anexo 1 de la convocatoria institucional.
        </p>
      </div>

      <NuevaNotaForm
        convocatorias={convocatorias}
        directores={directores}
        catalogos={catalogos}
        departamentos={departamentos}
        provincias={provincias}
        sedes={SEDES}
      />
    </div>
  );
}
