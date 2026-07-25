"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Checkbox,
  Field,
  Input,
  Select,
  Textarea,
  formatUSD,
} from "@/components/ui";
import {
  Catalogos,
  ClaveAlineamiento,
  Convocatoria,
  Departamento,
  Director,
  NivelCobertura,
  NIVELES_COBERTURA,
  Provincia,
} from "@/lib/types";
import { PRESUPUESTO_MAX_USD, calcularTotalPresupuesto } from "@/lib/validations";

const today = new Date().toISOString().slice(0, 10);

const ALINEAMIENTO_GRUPOS: { key: ClaveAlineamiento; label: string }[] = [
  { key: "ambitosPrioritarios", label: "Ámbitos prioritarios" },
  { key: "objetivosODS2030", label: "Objetivos ODS 2030" },
  { key: "camposCineUnesco", label: "Campos CINE-UNESCO" },
  { key: "objetivosPND", label: "Objetivos PND" },
  { key: "objetivosGAD", label: "Objetivos GAD" },
  { key: "objetivosPlanEstrategico", label: "Objetivos del Plan Estratégico" },
  { key: "lineasInvestigacion", label: "Líneas de investigación" },
  { key: "dominioAcademico", label: "Dominio académico" },
];

// El formulario original paginaba el alineamiento de tres en tres grupos.
const ALINEAMIENTO_POR_PAGINA = 3;

const IMPACTOS: { key: keyof ImpactosForm; label: string }[] = [
  { key: "economico", label: "Económico" },
  { key: "social", label: "Social" },
  { key: "politico", label: "Político" },
  { key: "cientifico", label: "Científico" },
  { key: "ambiental", label: "Ambiental" },
  { key: "otros", label: "Otros" },
];

interface ImpactosForm {
  economico: string;
  social: string;
  politico: string;
  cientifico: string;
  ambiental: string;
  otros: string;
}

interface ItemForm {
  descripcion: string;
  cantidad: string;
  valorUnitario: string;
}

interface ActividadForm {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  responsable: string;
}

const initialItem: ItemForm = { descripcion: "", cantidad: "", valorUnitario: "" };
const initialActividad: ActividadForm = {
  nombre: "",
  fechaInicio: "",
  fechaFin: "",
  responsable: "",
};

const initialAlineamiento = Object.fromEntries(
  ALINEAMIENTO_GRUPOS.map((g) => [g.key, [] as string[]])
) as Record<ClaveAlineamiento, string[]>;

function SectionTitle({ n, children }: { n: number; children: string }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs text-white">
        {n}
      </span>
      {children}
    </h2>
  );
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function NuevaNotaForm({
  convocatorias,
  directores,
  catalogos,
  departamentos,
  provincias,
  sedes,
}: {
  convocatorias: Convocatoria[];
  directores: Director[];
  catalogos: Catalogos;
  departamentos: Departamento[];
  provincias: Provincia[];
  sedes: string[];
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    titulo: "",
    convocatoriaId: "",
    directorId: "",
    sedeUnidadAcademica: "",
    departamento: "",
    fechaRegistro: today,
    plazoInicio: "",
    plazoFin: "",
    resumen: "",
  });

  const [localizacion, setLocalizacion] = useState({
    cobertura: "Provincial" as NivelCobertura,
    provincia: "",
    canton: "",
    parroquia: "",
    detalleUbicacion: "",
  });

  const [sectorPoblacion, setSectorPoblacion] = useState({
    urbanoMarginal: false,
    rural: false,
    grupoAtencionPrioritaria: false,
  });

  const [alineamiento, setAlineamiento] =
    useState<Record<ClaveAlineamiento, string[]>>(initialAlineamiento);
  const [paginaAlineamiento, setPaginaAlineamiento] = useState(0);

  const [departamentosParticipantes, setDepartamentosParticipantes] = useState<string[]>([]);
  const [carrerasParticipantes, setCarrerasParticipantes] = useState<string[]>([]);

  const [impactos, setImpactos] = useState<ImpactosForm>({
    economico: "",
    social: "",
    politico: "",
    cientifico: "",
    ambiental: "",
    otros: "",
  });

  const [poblacion, setPoblacion] = useState({
    poblacionReferencia: "",
    poblacionPotencial: "",
    poblacionObjetivo: "",
    descripcion: "",
  });

  const [items, setItems] = useState<ItemForm[]>([initialItem]);
  const [aporteAuspiciante, setAporteAuspiciante] = useState("0");
  const [actividades, setActividades] = useState<ActividadForm[]>([initialActividad]);

  const [firmas, setFirmas] = useState({
    directorNota: "",
    directorCarrera: "",
    coordinadorVinculacion: "",
    directorDepartamento: "",
    fechaFirma: today,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");

  const totalPresupuesto = calcularTotalPresupuesto(
    items.map((i) => ({
      cantidad: Number(i.cantidad) || 0,
      valorUnitario: Number(i.valorUnitario) || 0,
    }))
  );
  const excedePresupuesto = totalPresupuesto > PRESUPUESTO_MAX_USD;

  // Cascada provincia → cantón → parroquia resuelta en memoria.
  const provinciaSel = useMemo(
    () => provincias.find((p) => p.id === localizacion.provincia),
    [provincias, localizacion.provincia]
  );
  const cantonSel = useMemo(
    () => provinciaSel?.cantones.find((c) => c.id === localizacion.canton),
    [provinciaSel, localizacion.canton]
  );

  const totalPaginasAlineamiento = Math.ceil(
    ALINEAMIENTO_GRUPOS.length / ALINEAMIENTO_POR_PAGINA
  );
  const gruposVisibles = ALINEAMIENTO_GRUPOS.slice(
    paginaAlineamiento * ALINEAMIENTO_POR_PAGINA,
    paginaAlineamiento * ALINEAMIENTO_POR_PAGINA + ALINEAMIENTO_POR_PAGINA
  );

  function updateItem(idx: number, patch: Partial<ItemForm>) {
    setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function updateActividad(idx: number, patch: Partial<ActividadForm>) {
    setActividades(actividades.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  }

  function toggleDepartamento(dep: Departamento, checked: boolean) {
    setDepartamentosParticipantes((prev) =>
      checked ? [...prev, dep.id] : prev.filter((id) => id !== dep.id)
    );
    // Al desmarcar un departamento se descartan también sus carreras.
    if (!checked) {
      const idsCarreras = dep.carreras.map((c) => c.id);
      setCarrerasParticipantes((prev) => prev.filter((id) => !idsCarreras.includes(id)));
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setErrorGeneral("");

    const payload = {
      ...form,
      localizacion,
      sectorPoblacion,
      alineamiento,
      departamentosParticipantes,
      carrerasParticipantes,
      impactosEsperados: impactos,
      caracterizacionPoblacion: {
        poblacionReferencia: Number(poblacion.poblacionReferencia) || 0,
        poblacionPotencial: Number(poblacion.poblacionPotencial) || 0,
        poblacionObjetivo: Number(poblacion.poblacionObjetivo) || 0,
        descripcion: poblacion.descripcion,
      },
      itemsPresupuesto: items.map((i) => ({
        descripcion: i.descripcion,
        cantidad: Number(i.cantidad) || 0,
        valorUnitario: Number(i.valorUnitario) || 0,
      })),
      aporteEntidadAuspiciante: Number(aporteAuspiciante) || 0,
      actividades,
      firmas,
    };

    const res = await fetch("/api/notas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      const fieldErrors: Record<string, string> = {};
      for (const issue of data.detalles ?? []) {
        fieldErrors[issue.path.join(".")] = issue.message;
      }
      setErrors(fieldErrors);
      setErrorGeneral("Revisa los campos marcados en rojo antes de continuar.");
      setLoading(false);
      return;
    }

    const nota = await res.json();
    router.push(`/notas/${nota.id}`);
  }

  const sinConvocatorias = convocatorias.length === 0;
  const sinDirectores = directores.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {(sinConvocatorias || sinDirectores) && (
        <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {sinConvocatorias && <p>Debes crear al menos una convocatoria antes de registrar una nota.</p>}
          {sinDirectores && <p>Debes registrar al menos un director antes de registrar una nota.</p>}
        </Card>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <Card className="p-6">
          <SectionTitle n={1}>Datos generales</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Nombre del proyecto" error={errors.titulo}>
                <Input
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Convocatoria" error={errors.convocatoriaId}>
              <Select
                value={form.convocatoriaId}
                onChange={(e) => setForm({ ...form, convocatoriaId: e.target.value })}
              >
                <option value="">Selecciona una convocatoria</option>
                {convocatorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Director responsable" error={errors.directorId}>
              <Select
                value={form.directorId}
                onChange={(e) => setForm({ ...form, directorId: e.target.value })}
              >
                <option value="">Selecciona un director</option>
                {directores.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombres} ({d.correo})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Sede / unidad académica" error={errors.sedeUnidadAcademica}>
              <Select
                value={form.sedeUnidadAcademica}
                onChange={(e) => setForm({ ...form, sedeUnidadAcademica: e.target.value })}
              >
                <option value="">Selecciona una sede</option>
                {sedes.map((sede) => (
                  <option key={sede} value={sede}>
                    {sede}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Departamento" error={errors.departamento}>
              <Select
                value={form.departamento}
                onChange={(e) => setForm({ ...form, departamento: e.target.value })}
              >
                <option value="">Selecciona un departamento</option>
                {departamentos.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.nombre}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Fecha de registro" error={errors.fechaRegistro}>
              <Input
                type="date"
                value={form.fechaRegistro}
                onChange={(e) => setForm({ ...form, fechaRegistro: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Inicio de ejecución" error={errors.plazoInicio}>
                <Input
                  type="date"
                  value={form.plazoInicio}
                  onChange={(e) => setForm({ ...form, plazoInicio: e.target.value })}
                />
              </Field>
              <Field label="Fin de ejecución" error={errors.plazoFin}>
                <Input
                  type="date"
                  value={form.plazoFin}
                  onChange={(e) => setForm({ ...form, plazoFin: e.target.value })}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Resumen">
                <Textarea
                  rows={3}
                  value={form.resumen}
                  onChange={(e) => setForm({ ...form, resumen: e.target.value })}
                />
              </Field>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle n={2}>Localización geográfica</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nivel de cobertura" error={errors["localizacion.cobertura"]}>
              <Select
                value={localizacion.cobertura}
                onChange={(e) =>
                  setLocalizacion({
                    ...localizacion,
                    cobertura: e.target.value as NivelCobertura,
                  })
                }
              >
                {NIVELES_COBERTURA.map((nivel) => (
                  <option key={nivel} value={nivel}>
                    {nivel}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Provincia" error={errors["localizacion.provincia"]}>
              <Select
                value={localizacion.provincia}
                onChange={(e) =>
                  setLocalizacion({
                    ...localizacion,
                    provincia: e.target.value,
                    canton: "",
                    parroquia: "",
                  })
                }
              >
                <option value="">Selecciona una provincia</option>
                {provincias.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Cantón" error={errors["localizacion.canton"]}>
              <Select
                disabled={!provinciaSel}
                value={localizacion.canton}
                onChange={(e) =>
                  setLocalizacion({ ...localizacion, canton: e.target.value, parroquia: "" })
                }
              >
                <option value="">Selecciona un cantón</option>
                {provinciaSel?.cantones.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Parroquia" error={errors["localizacion.parroquia"]}>
              <Select
                disabled={!cantonSel}
                value={localizacion.parroquia}
                onChange={(e) => setLocalizacion({ ...localizacion, parroquia: e.target.value })}
              >
                <option value="">Selecciona una parroquia</option>
                {cantonSel?.parroquias.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Detalle de la ubicación">
                <Textarea
                  rows={2}
                  value={localizacion.detalleUbicacion}
                  onChange={(e) =>
                    setLocalizacion({ ...localizacion, detalleUbicacion: e.target.value })
                  }
                />
              </Field>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle n={3}>Sector de población beneficiaria</SectionTitle>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Checkbox
              label="Urbano marginal"
              checked={sectorPoblacion.urbanoMarginal}
              onChange={(v) => setSectorPoblacion({ ...sectorPoblacion, urbanoMarginal: v })}
            />
            <Checkbox
              label="Rural"
              checked={sectorPoblacion.rural}
              onChange={(v) => setSectorPoblacion({ ...sectorPoblacion, rural: v })}
            />
            <Checkbox
              label="Grupo de atención prioritaria"
              checked={sectorPoblacion.grupoAtencionPrioritaria}
              onChange={(v) =>
                setSectorPoblacion({ ...sectorPoblacion, grupoAtencionPrioritaria: v })
              }
            />
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle n={4}>Alineamiento</SectionTitle>
          <div className="flex flex-col gap-5">
            {gruposVisibles.map((grupo) => (
              <div key={grupo.key}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {grupo.label}
                </h3>
                <div className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
                  {catalogos[grupo.key].map((opcion) => (
                    <Checkbox
                      key={opcion}
                      label={opcion}
                      checked={alineamiento[grupo.key].includes(opcion)}
                      onChange={() =>
                        setAlineamiento({
                          ...alineamiento,
                          [grupo.key]: toggle(alineamiento[grupo.key], opcion),
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={paginaAlineamiento === 0}
              onClick={() => setPaginaAlineamiento((p) => Math.max(0, p - 1))}
            >
              Anterior
            </Button>
            <span className="text-xs text-slate-400">
              Página {paginaAlineamiento + 1} de {totalPaginasAlineamiento}
            </span>
            <Button
              type="button"
              variant="secondary"
              disabled={paginaAlineamiento === totalPaginasAlineamiento - 1}
              onClick={() =>
                setPaginaAlineamiento((p) => Math.min(totalPaginasAlineamiento - 1, p + 1))
              }
            >
              Siguiente
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle n={5}>Departamentos y carreras participantes</SectionTitle>
          {errors.departamentosParticipantes && (
            <p className="mb-3 text-xs font-medium text-red-600">
              {errors.departamentosParticipantes}
            </p>
          )}
          <div className="flex flex-col gap-3">
            {departamentos.map((dep) => (
              <div key={dep.id} className="rounded-lg border border-slate-200 p-3">
                <Checkbox
                  label={dep.nombre}
                  className="font-medium"
                  checked={departamentosParticipantes.includes(dep.id)}
                  onChange={(v) => toggleDepartamento(dep, v)}
                />
                <div className="mt-2 grid grid-cols-1 gap-2 pl-6 sm:grid-cols-2">
                  {dep.carreras.map((carrera) => (
                    <Checkbox
                      key={carrera.id}
                      label={carrera.nombre}
                      checked={carrerasParticipantes.includes(carrera.id)}
                      onChange={() =>
                        setCarrerasParticipantes(toggle(carrerasParticipantes, carrera.id))
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle n={6}>Impactos esperados</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {IMPACTOS.map((impacto) => (
              <Field key={impacto.key} label={impacto.label}>
                <Textarea
                  rows={2}
                  value={impactos[impacto.key]}
                  onChange={(e) => setImpactos({ ...impactos, [impacto.key]: e.target.value })}
                />
              </Field>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle n={7}>Caracterización de la población</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field
              label="Población de referencia"
              error={errors["caracterizacionPoblacion.poblacionReferencia"]}
            >
              <Input
                type="number"
                value={poblacion.poblacionReferencia}
                onChange={(e) =>
                  setPoblacion({ ...poblacion, poblacionReferencia: e.target.value })
                }
              />
            </Field>
            <Field
              label="Población potencial"
              error={errors["caracterizacionPoblacion.poblacionPotencial"]}
              hint="No puede ser mayor que la población de referencia."
            >
              <Input
                type="number"
                value={poblacion.poblacionPotencial}
                onChange={(e) =>
                  setPoblacion({ ...poblacion, poblacionPotencial: e.target.value })
                }
              />
            </Field>
            <Field
              label="Población objetivo"
              error={errors["caracterizacionPoblacion.poblacionObjetivo"]}
              hint="No puede ser mayor que la población de referencia."
            >
              <Input
                type="number"
                value={poblacion.poblacionObjetivo}
                onChange={(e) =>
                  setPoblacion({ ...poblacion, poblacionObjetivo: e.target.value })
                }
              />
            </Field>
            <div className="sm:col-span-3">
              <Field label="Descripción de la población">
                <Textarea
                  rows={2}
                  value={poblacion.descripcion}
                  onChange={(e) => setPoblacion({ ...poblacion, descripcion: e.target.value })}
                />
              </Field>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle n={8}>Presupuesto</SectionTitle>
          {errors.itemsPresupuesto && (
            <p className="mb-3 text-xs font-medium text-red-600">{errors.itemsPresupuesto}</p>
          )}
          <div className="flex flex-col gap-3">
            {items.map((item, idx) => {
              const subtotal =
                (Number(item.cantidad) || 0) * (Number(item.valorUnitario) || 0);
              return (
                <div
                  key={idx}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_120px_140px_140px_auto]"
                >
                  <Field
                    label="Descripción del ítem"
                    error={errors[`itemsPresupuesto.${idx}.descripcion`]}
                  >
                    <Input
                      value={item.descripcion}
                      onChange={(e) => updateItem(idx, { descripcion: e.target.value })}
                    />
                  </Field>
                  <Field label="Cantidad" error={errors[`itemsPresupuesto.${idx}.cantidad`]}>
                    <Input
                      type="number"
                      value={item.cantidad}
                      onChange={(e) => updateItem(idx, { cantidad: e.target.value })}
                    />
                  </Field>
                  <Field
                    label="Valor unitario (USD)"
                    error={errors[`itemsPresupuesto.${idx}.valorUnitario`]}
                  >
                    <Input
                      type="number"
                      step="0.01"
                      value={item.valorUnitario}
                      onChange={(e) => updateItem(idx, { valorUnitario: e.target.value })}
                    />
                  </Field>
                  <Field label="Total">
                    <Input readOnly value={formatUSD(subtotal)} />
                  </Field>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={items.length === 1}
                      onClick={() => setItems(items.filter((_, i) => i !== idx))}
                    >
                      Quitar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <Button type="button" variant="secondary" onClick={() => setItems([...items, initialItem])}>
              + Agregar ítem
            </Button>
            <div className="w-full sm:w-56">
              <Field
                label="Aporte entidad auspiciante (USD)"
                error={errors.aporteEntidadAuspiciante}
              >
                <Input
                  type="number"
                  step="0.01"
                  value={aporteAuspiciante}
                  onChange={(e) => setAporteAuspiciante(e.target.value)}
                />
              </Field>
            </div>
            <div className={`text-sm font-semibold ${excedePresupuesto ? "text-red-600" : "text-slate-700"}`}>
              Total: {formatUSD(totalPresupuesto)}{" "}
              <span className="font-normal text-slate-400">
                (máximo {formatUSD(PRESUPUESTO_MAX_USD)})
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle n={9}>Cronograma de ejecución</SectionTitle>
          {errors.actividades && (
            <p className="mb-3 text-xs font-medium text-red-600">{errors.actividades}</p>
          )}
          <div className="flex flex-col gap-3">
            {actividades.map((act, idx) => (
              <div key={idx} className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_140px_140px_1fr_auto]">
                <Field label="Actividad" error={errors[`actividades.${idx}.nombre`]}>
                  <Input
                    value={act.nombre}
                    onChange={(e) => updateActividad(idx, { nombre: e.target.value })}
                  />
                </Field>
                <Field label="Fecha inicio" error={errors[`actividades.${idx}.fechaInicio`]}>
                  <Input
                    type="date"
                    value={act.fechaInicio}
                    onChange={(e) => updateActividad(idx, { fechaInicio: e.target.value })}
                  />
                </Field>
                <Field label="Fecha fin" error={errors[`actividades.${idx}.fechaFin`]}>
                  <Input
                    type="date"
                    value={act.fechaFin}
                    onChange={(e) => updateActividad(idx, { fechaFin: e.target.value })}
                  />
                </Field>
                <Field label="Responsable" error={errors[`actividades.${idx}.responsable`]}>
                  <Input
                    value={act.responsable}
                    onChange={(e) => updateActividad(idx, { responsable: e.target.value })}
                  />
                </Field>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={actividades.length === 1}
                    onClick={() => setActividades(actividades.filter((_, i) => i !== idx))}
                  >
                    Quitar
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            onClick={() => setActividades([...actividades, initialActividad])}
          >
            + Agregar actividad
          </Button>
        </Card>

        <Card className="p-6">
          <SectionTitle n={10}>Firmas de responsabilidad</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Director de la nota" error={errors["firmas.directorNota"]}>
              <Input
                value={firmas.directorNota}
                onChange={(e) => setFirmas({ ...firmas, directorNota: e.target.value })}
              />
            </Field>
            <Field label="Director de carrera">
              <Input
                value={firmas.directorCarrera}
                onChange={(e) => setFirmas({ ...firmas, directorCarrera: e.target.value })}
              />
            </Field>
            <Field label="Coordinador de vinculación">
              <Input
                value={firmas.coordinadorVinculacion}
                onChange={(e) =>
                  setFirmas({ ...firmas, coordinadorVinculacion: e.target.value })
                }
              />
            </Field>
            <Field label="Director de departamento">
              <Input
                value={firmas.directorDepartamento}
                onChange={(e) =>
                  setFirmas({ ...firmas, directorDepartamento: e.target.value })
                }
              />
            </Field>
            <Field label="Fecha de firma" error={errors["firmas.fechaFirma"]}>
              <Input
                type="date"
                value={firmas.fechaFirma}
                onChange={(e) => setFirmas({ ...firmas, fechaFirma: e.target.value })}
              />
            </Field>
          </div>
        </Card>

        {errorGeneral && <p className="text-sm font-medium text-red-600">{errorGeneral}</p>}

        <div>
          <Button type="submit" disabled={loading || sinConvocatorias || sinDirectores}>
            {loading ? "Guardando..." : "Registrar nota conceptual"}
          </Button>
        </div>
      </form>
    </div>
  );
}
