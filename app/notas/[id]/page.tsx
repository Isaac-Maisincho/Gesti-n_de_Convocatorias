import { notFound } from "next/navigation";
import { Card, EstadoBadge, formatFecha, formatUSD } from "@/components/ui";
import CambiarEstadoForm from "@/components/forms/CambiarEstadoForm";
import { obtenerConvocatoria } from "@/lib/repositories/convocatorias";
import { obtenerDirector } from "@/lib/repositories/directores";
import { obtenerNota } from "@/lib/repositories/notas";
import { calcularTotalPresupuesto } from "@/lib/validations";
import {
  ALINEAMIENTO_GRUPOS,
  nombreCanton,
  nombreCarrera,
  nombreDepartamento,
  nombreParroquia,
  nombreProvincia,
} from "@/lib/catalogos";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">{title}</h2>
      {children}
    </Card>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-sm text-slate-800">{value || "-"}</div>
    </div>
  );
}

function Etiquetas({ items }: { items: string[] }) {
  if (items.length === 0) return <span className="text-sm text-slate-400">-</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NotaDetallePage({ params }: PageProps) {
  const { id } = await params;
  const nota = await obtenerNota(id);

  if (!nota) {
    notFound();
  }

  const [convocatoria, director] = await Promise.all([
    obtenerConvocatoria(nota.convocatoriaId),
    obtenerDirector(nota.directorId),
  ]);

  const totalItems = calcularTotalPresupuesto(nota.itemsPresupuesto);
  const totalGeneral = totalItems + (nota.aporteEntidadAuspiciante ?? 0);

  const { localizacion, sectorPoblacion, caracterizacionPoblacion, impactosEsperados, firmas } =
    nota;

  const sectoresActivos = [
    sectorPoblacion.urbanoMarginal && "Urbano marginal",
    sectorPoblacion.rural && "Rural",
    sectorPoblacion.grupoAtencionPrioritaria && "Grupo de atención prioritaria",
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{nota.titulo}</h1>
            <EstadoBadge estado={nota.estado} />
          </div>
          <p className="mt-1 font-mono text-sm text-slate-500">{nota.codigo}</p>
        </div>
      </div>

      <CambiarEstadoForm notaId={nota.id} estadoActual={nota.estado} />

      <Section title="1. Datos generales">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Info label="Convocatoria" value={convocatoria?.nombre} />
          <Info
            label="Director responsable"
            value={director ? `${director.nombres} (${director.correo})` : undefined}
          />
          <Info label="Sede / unidad académica" value={nota.sedeUnidadAcademica} />
          <Info label="Departamento" value={nombreDepartamento(nota.departamento)} />
          <Info label="Fecha de registro" value={formatFecha(nota.fechaRegistro)} />
          <Info
            label="Plazo de ejecución"
            value={`${formatFecha(nota.plazoInicio)} — ${formatFecha(nota.plazoFin)}`}
          />
          <div className="sm:col-span-2">
            <Info label="Resumen" value={nota.resumen} />
          </div>
        </div>
      </Section>

      <Section title="2. Localización geográfica">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Info label="Nivel de cobertura" value={localizacion.cobertura} />
          <Info
            label="Provincia"
            value={localizacion.provincia ? nombreProvincia(localizacion.provincia) : undefined}
          />
          <Info
            label="Cantón"
            value={
              localizacion.canton
                ? nombreCanton(localizacion.provincia, localizacion.canton)
                : undefined
            }
          />
          <Info
            label="Parroquia"
            value={
              localizacion.parroquia
                ? nombreParroquia(localizacion.provincia, localizacion.canton, localizacion.parroquia)
                : undefined
            }
          />
          <div className="sm:col-span-2">
            <Info label="Detalle de ubicación" value={localizacion.detalleUbicacion} />
          </div>
        </div>
      </Section>

      <Section title="3. Sector de población beneficiaria">
        <Etiquetas items={sectoresActivos} />
      </Section>

      <Section title="4. Alineamiento">
        <div className="flex flex-col gap-4">
          {ALINEAMIENTO_GRUPOS.map((grupo) => (
            <div key={grupo.key}>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                {grupo.label}
              </div>
              <Etiquetas items={nota.alineamiento[grupo.key] ?? []} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="5. Departamentos y carreras participantes">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
              Departamentos
            </div>
            <Etiquetas items={nota.departamentosParticipantes.map(nombreDepartamento)} />
          </div>
          <div>
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
              Carreras
            </div>
            <Etiquetas items={nota.carrerasParticipantes.map(nombreCarrera)} />
          </div>
        </div>
      </Section>

      <Section title="6. Impactos esperados">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Info label="Económico" value={impactosEsperados.economico} />
          <Info label="Social" value={impactosEsperados.social} />
          <Info label="Político" value={impactosEsperados.politico} />
          <Info label="Científico" value={impactosEsperados.cientifico} />
          <Info label="Ambiental" value={impactosEsperados.ambiental} />
          <Info label="Otros" value={impactosEsperados.otros} />
        </div>
      </Section>

      <Section title="7. Caracterización de la población">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Info
            label="Población de referencia"
            value={caracterizacionPoblacion.poblacionReferencia.toLocaleString()}
          />
          <Info
            label="Población potencial"
            value={caracterizacionPoblacion.poblacionPotencial.toLocaleString()}
          />
          <Info
            label="Población objetivo"
            value={caracterizacionPoblacion.poblacionObjetivo.toLocaleString()}
          />
          <div className="sm:col-span-3">
            <Info label="Descripción" value={caracterizacionPoblacion.descripcion} />
          </div>
        </div>
      </Section>

      <Section title="8. Presupuesto">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2 pr-4">Descripción</th>
                <th className="py-2 pr-4">Cantidad</th>
                <th className="py-2 pr-4">Valor unitario</th>
                <th className="py-2 pr-4">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {nota.itemsPresupuesto.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 pr-4">{item.descripcion}</td>
                  <td className="py-2 pr-4">{item.cantidad}</td>
                  <td className="py-2 pr-4">{formatUSD(item.valorUnitario)}</td>
                  <td className="py-2 pr-4 font-medium">
                    {formatUSD(item.cantidad * item.valorUnitario)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-col items-end gap-1 text-sm text-slate-700">
          <div>Subtotal ítems: {formatUSD(totalItems)}</div>
          <div>Aporte entidad auspiciante: {formatUSD(nota.aporteEntidadAuspiciante ?? 0)}</div>
          <div className="text-base font-bold text-slate-900">
            Total: {formatUSD(totalGeneral)}
          </div>
        </div>
      </Section>

      <Section title="9. Cronograma">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2 pr-4">Actividad</th>
                <th className="py-2 pr-4">Inicio</th>
                <th className="py-2 pr-4">Fin</th>
                <th className="py-2 pr-4">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {nota.actividades.map((act) => (
                <tr key={act.id}>
                  <td className="py-2 pr-4">{act.nombre}</td>
                  <td className="py-2 pr-4">{formatFecha(act.fechaInicio)}</td>
                  <td className="py-2 pr-4">{formatFecha(act.fechaFin)}</td>
                  <td className="py-2 pr-4">{act.responsable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="10. Firmas de responsabilidad">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Info label="Director de la nota" value={firmas.directorNota} />
          <Info label="Director de carrera" value={firmas.directorCarrera} />
          <Info label="Coordinador de vinculación" value={firmas.coordinadorVinculacion} />
          <Info label="Director de departamento" value={firmas.directorDepartamento} />
          <Info label="Fecha de firma" value={formatFecha(firmas.fechaFirma)} />
        </div>
      </Section>
    </div>
  );
}
