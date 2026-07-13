// ============================================================
// Type Definitions
// ============================================================

type NotaTabla = {
  codigo: string;
  nombreProyecto: string;
  estado: string;
  presupuesto: number;
  sede: string;
};

type ConvocatoriaRes = {
  exito: boolean;
  mensaje: string;
  datos: { id: string; anio: number; estado: string }[];
};

type DirectorRes = {
  exito: boolean;
  mensaje: string;
  datos: { id: string; nombre: string; correo: string; telefono: string }[];
};

type NotasRes = {
  exito: boolean;
  mensaje: string;
  datos: {
    datos: {
      codigo: string;
      nombreProyecto: string;
      estado: string;
      presupuesto: { items: { total: number }[] };
      sedeUnidadAcademica: string;
      directorId: string;
      localizacion: { cobertura: string };
      caracterizacionPoblacion: { poblacionObjetivo: number };
      cronograma: { id: string }[];
    }[];
    paginacion: { totalRegistros: number };
  };
};

type NotaDetalle = {
  exito: boolean;
  datos?: {
    codigo: string;
    nombreProyecto: string;
    estado: string;
    presupuesto: { items: { id: string; descripcion: string; cantidad: number; valorUnitario: number; total: number }[]; aporteEntidadAuspiciante: number };
    sedeUnidadAcademica: string;
    directorId: string;
    localizacion: { cobertura: string; provincia?: string; detalleUbicacion: string };
    caracterizacionPoblacion: { poblacionReferencia: number; poblacionPotencial: number; poblacionObjetivo: number };
    cronograma: { id: string; descripcion: string; fechaInicio: string; fechaFin: string; responsable: string }[];
    alineamiento: any;
    impactosEsperados: any;
    convocatoriaId: string;
  };
};

type EstadisticasRes = {
  exito: boolean;
  datos?: {
    presupuestoTotal: number;
    promedioPorNota: number;
    conteosPorEstado: { [key: string]: number };
  };
};

// ============================================================
// DOM Elements
// ============================================================

const navButtons = document.querySelectorAll<HTMLButtonElement>('.nav-button');
const panels = document.querySelectorAll<HTMLElement>('.section-panel');
const notesTableBody = document.getElementById('notes-table-body') as HTMLTableSectionElement;
const statNotas = document.getElementById('stat-notas') as HTMLElement;
const statPresupuesto = document.getElementById('stat-presupuesto') as HTMLElement;
const statPromedio = document.getElementById('stat-promedio') as HTMLElement;
const panelSummary = document.getElementById('panel-summary') as HTMLElement;
const convocatoriasList = document.getElementById('convocatorias-list') as HTMLElement;
const directoresList = document.getElementById('directores-list') as HTMLElement;
const notasList = document.getElementById('notas-list') as HTMLElement;

// ============================================================
// UI Utilities
// ============================================================

function switchPanel(section: string) {
  panels.forEach((panel) => panel.classList.toggle('hidden', panel.id !== `panel-${section}`));
  navButtons.forEach((button) => button.classList.toggle('active', button.dataset.section === section));
}

function formatMoney(value: number): string {
  return value.toLocaleString('es-EC', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

function tagsByEstado(estado: string): string {
  switch (estado) {
    case 'registrada': return '<span class="tag registered">Registrada</span>';
    case 'en revisión': return '<span class="tag review">En Revisión</span>';
    case 'aprobada': return '<span class="tag approved">Aprobada</span>';
    case 'rechazada': return '<span class="tag">Rechazada</span>';
    default: return `<span class="tag">${estado}</span>`;
  }
}

function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 20px;
    border-radius: 12px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    ${type === 'success' ? 'background: #10b981;' : type === 'error' ? 'background: #ef4444;' : 'background: #3b82f6;'}
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// ============================================================
// API Utilities
// ============================================================

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(path, { cache: 'no-store', ...options });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.mensaje || response.statusText);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error('Fetch error', path, error);
    showNotification(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
    return null;
  }
}

async function postJson<T>(path: string, data: any): Promise<T | null> {
  return fetchJson<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

async function patchJson<T>(path: string, data: any): Promise<T | null> {
  return fetchJson<T>(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// ============================================================
// Dashboard & Statistics
// ============================================================

function buildNotesTable(notas: NotaTabla[]) {
  notesTableBody.innerHTML = notas
    .map(
      (nota) => `
    <tr data-codigo="${nota.codigo}">
      <td><strong>${nota.codigo}</strong></td>
      <td>${nota.nombreProyecto}<br><small>${nota.sede}</small></td>
      <td>${tagsByEstado(nota.estado)}</td>
      <td>${formatMoney(nota.presupuesto)}</td>
      <td><button class="table-action" onclick="viewNoteDetail('${nota.codigo}')">Ver Detalle</button></td>
    </tr>
  `
    )
    .join('');
}

async function refreshDashboard() {
  const notas = await fetchJson<NotasRes>('/api/notas?limite=100');
  const stats = await fetchJson<EstadisticasRes>('/api/estadisticas/presupuesto-general');

  if (!notas || !notas.exito) {
    panelSummary.textContent = 'No se pudieron cargar las notas.';
    return;
  }

  const listaNotas = notas.datos.datos.map((nota) => ({
    codigo: nota.codigo,
    nombreProyecto: nota.nombreProyecto,
    sede: nota.sedeUnidadAcademica,
    estado: nota.estado,
    presupuesto: nota.presupuesto.items.reduce((sum, item) => sum + item.total, 0),
  }));

  buildNotesTable(listaNotas);

  if (stats && stats.exito && stats.datos) {
    statNotas.textContent = String(notas.datos.paginacion.totalRegistros);
    statPresupuesto.textContent = formatMoney(stats.datos.presupuestoTotal);
    statPromedio.textContent = formatMoney(stats.datos.promedioPorNota);
  }

  panelSummary.textContent = `${listaNotas.length} notas conceptuales cargadas.`;
}

// ============================================================
// List Views
// ============================================================

function buildList(container: HTMLElement, items: Array<{ title: string; subtitle: string; onClick?: () => void }>) {
  container.innerHTML = items
    .map(
      (item, i) => `
    <div class="list-item" onclick="handleListItemClick(this, ${i})">
      <div><strong>${item.title}</strong><span>${item.subtitle}</span></div>
    </div>
  `
    )
    .join('');
}

function handleListItemClick(element: HTMLElement, index: number) {
  element.style.opacity = '0.7';
  setTimeout(() => (element.style.opacity = '1'), 150);
}

async function refreshConvocatorias() {
  const conv = await fetchJson<ConvocatoriaRes>('/api/convocatorias');
  if (!conv || !conv.exito) {
    convocatoriasList.innerHTML = '<p style="color: #ef4444;">Error al cargar convocatorias</p>';
    return;
  }
  buildList(
    convocatoriasList,
    conv.datos.map((item) => ({ title: `Convocatoria ${item.anio}`, subtitle: `Estado: ${item.estado}` }))
  );
}

async function refreshDirectores() {
  const data = await fetchJson<DirectorRes>('/api/directores');
  if (!data || !data.exito) {
    directoresList.innerHTML = '<p style="color: #ef4444;">Error al cargar directores</p>';
    return;
  }
  buildList(
    directoresList,
    data.datos.map((item) => ({ title: item.nombre, subtitle: `${item.correo} · ${item.telefono}` }))
  );
}

async function refreshNotas() {
  const notas = await fetchJson<NotasRes>('/api/notas?limite=100');
  if (!notas || !notas.exito) {
    notasList.innerHTML = '<p style="color: #ef4444;">Error al cargar notas</p>';
    return;
  }
  buildList(
    notasList,
    notas.datos.datos.map((nota) => ({ title: nota.codigo, subtitle: `${nota.nombreProyecto} · ${nota.estado}` }))
  );
}

// ============================================================
// Note Detail View & Management
// ============================================================

async function viewNoteDetail(codigo: string) {
  const nota = await fetchJson<NotaDetalle>(`/api/notas/${codigo}`);
  if (!nota || !nota.exito || !nota.datos) {
    showNotification('No se pudo cargar la nota', 'error');
    return;
  }

  const d = nota.datos;
  const totalBudget = d.presupuesto.items.reduce((s, item) => s + item.total, 0);

  const detailHtml = `
    <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 999;" onclick="if(event.target === this) this.remove()">
      <div style="background: #0e1624; border-radius: 24px; padding: 32px; max-width: 900px; max-height: 90vh; overflow-y: auto; width: 90%; box-shadow: 0 25px 50px rgba(0,0,0,0.5)">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 24px;">
          <div>
            <h2 style="margin: 0; font-size: 1.8rem;">${d.codigo}</h2>
            <p style="margin: 8px 0 0 0; color: #8c98b3;">${d.nombreProyecto}</p>
          </div>
          <button onclick="this.closest('[style*=position]').remove()" style="background: none; border: none; color: #8c98b3; font-size: 24px; cursor: pointer;">✕</button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
          <div style="background: #111827; padding: 16px; border-radius: 12px;">
            <p style="margin: 0 0 8px 0; color: #8c98b3; font-size: 0.9rem;">Estado</p>
            <p style="margin: 0; font-size: 1.1rem;">${tagsByEstado(d.estado)}</p>
          </div>
          <div style="background: #111827; padding: 16px; border-radius: 12px;">
            <p style="margin: 0 0 8px 0; color: #8c98b3; font-size: 0.9rem;">Presupuesto Total</p>
            <p style="margin: 0; font-size: 1.1rem;">${formatMoney(totalBudget)}</p>
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; font-size: 1.1rem;">Información General</h3>
          <div style="background: #111827; padding: 16px; border-radius: 12px; color: #c9d2e8;">
            <p style="margin: 0 0 8px 0;"><strong>Sede:</strong> ${d.sedeUnidadAcademica}</p>
            <p style="margin: 0 0 8px 0;"><strong>Cobertura:</strong> ${d.localizacion.cobertura}</p>
            <p style="margin: 0 0 8px 0;"><strong>Ubicación:</strong> ${d.localizacion.detalleUbicacion}</p>
            <p style="margin: 0;"><strong>Población Objetivo:</strong> ${d.caracterizacionPoblacion.poblacionObjetivo} de ${d.caracterizacionPoblacion.poblacionReferencia}</p>
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; font-size: 1.1rem;">Presupuesto (${d.presupuesto.items.length} ítems)</h3>
          <div style="background: #111827; border-radius: 12px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
              ${d.presupuesto.items
                .map(
                  (item) => `
                <tr style="border-bottom: 1px solid #1f2937;">
                  <td style="padding: 12px; color: #c9d2e8;">${item.descripcion}</td>
                  <td style="padding: 12px; text-align: right; color: #94a3b8; font-size: 0.9rem;">${item.cantidad} × ${formatMoney(item.valorUnitario)}</td>
                  <td style="padding: 12px; text-align: right; color: #e8edf5; font-weight: 600;">${formatMoney(item.total)}</td>
                </tr>
              `
                )
                .join('')}
              <tr style="background: #1f2937;">
                <td colspan="2" style="padding: 12px; font-weight: 600;">Aporte Entidad Auspiciante</td>
                <td style="padding: 12px; text-align: right; color: #10b981; font-weight: 600;">+${formatMoney(d.presupuesto.aporteEntidadAuspiciante)}</td>
              </tr>
            </table>
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; font-size: 1.1rem;">Cronograma (${d.cronograma.length} actividades)</h3>
          <div style="display: grid; gap: 12px;">
            ${d.cronograma
              .map(
                (act) => `
              <div style="background: #111827; padding: 12px; border-radius: 8px; border-left: 3px solid #3b82f6;">
                <p style="margin: 0 0 6px 0; font-weight: 500;">${act.descripcion}</p>
                <p style="margin: 0; color: #94a3b8; font-size: 0.9rem;">${new Date(act.fechaInicio).toLocaleDateString('es-EC')} - ${new Date(act.fechaFin).toLocaleDateString('es-EC')}</p>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <div style="display: flex; gap: 12px;">
          <select id="status-select" style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid #1f2937; background: #111827; color: #e8edf5; cursor: pointer;">
            <option value="">Cambiar Estado</option>
            <option value="registrada">Registrada</option>
            <option value="en revisión">En Revisión</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
          </select>
          <button onclick="changeNoteStatus('${codigo}', document.getElementById('status-select'))" style="padding: 12px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Actualizar</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', detailHtml);
}

async function changeNoteStatus(codigo: string, selectElement: HTMLSelectElement) {
  const estado = selectElement.value;
  if (!estado) return;

  const result = await patchJson<{ exito: boolean; mensaje: string }>(`/api/notas/${codigo}/estado`, { estado });
  if (result && result.exito) {
    showNotification(`Estado actualizado a "${estado}"`, 'success');
    selectElement.closest('[style*=position]')?.remove();
    refreshDashboard();
  }
}

// ============================================================
// Event Listeners
// ============================================================

navButtons.forEach((button: HTMLButtonElement) => {
  button.addEventListener('click', () => {
    const section = button.dataset.section;
    if (!section) return;
    switchPanel(section);
    if (section === 'dashboard') refreshDashboard();
    if (section === 'convocatorias') refreshConvocatorias();
    if (section === 'directores') refreshDirectores();
    if (section === 'notas') refreshNotas();
  });
});

document.getElementById('new-note')?.addEventListener('click', () => {
  showNotification('Funcionalidad de nueva nota será implementada en la próxima fase', 'info');
});

// ============================================================
// Initialize
// ============================================================

refreshDashboard();
