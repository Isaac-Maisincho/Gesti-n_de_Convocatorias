"use strict";
// ============================================================
// Type Definitions
// ============================================================
// ============================================================
// DOM Elements
// ============================================================
const navButtons = document.querySelectorAll('.nav-button');
const panels = document.querySelectorAll('.section-panel');
const notesTableBody = document.getElementById('notes-table-body');
const statNotas = document.getElementById('stat-notas');
const statPresupuesto = document.getElementById('stat-presupuesto');
const statPromedio = document.getElementById('stat-promedio');
const panelSummary = document.getElementById('panel-summary');
const convocatoriasList = document.getElementById('convocatorias-list');
const directoresList = document.getElementById('directores-list');
const notasList = document.getElementById('notas-list');
const cronogramaPanel = document.getElementById('cronograma-panel');
const firmasPanel = document.getElementById('firmas-panel');
const searchCodeInput = document.getElementById('search-code');
const searchButton = document.getElementById('search-button');
const openNoteFormButton = document.getElementById('open-note-form');
const newNoteButton = document.getElementById('new-note');
let catalogosData = null;
let departamentosData = [];
let provinciasData = [];
const SEDES = [
    'Matriz Sangolquí',
    'Campus Latacunga',
    'Campus Tumbaco',
    'URC Guayaquil',
    'Sede Ibarra',
];
const ALINEAMIENTO_GRUPOS = [
    { key: 'ambitosPrioritarios', label: 'Ámbitos Prioritarios' },
    { key: 'objetivosODS2030', label: 'Objetivos ODS 2030' },
    { key: 'camposCineUnesco', label: 'Campos CINE-UNESCO' },
    { key: 'objetivosPND', label: 'Objetivos PND' },
    { key: 'objetivosGAD', label: 'Objetivos GAD' },
    { key: 'objetivosPlanEstrategico', label: 'Objetivos Plan Estratégico' },
    { key: 'lineasInvestigacion', label: 'Líneas de Investigación' },
    { key: 'dominioAcademico', label: 'Dominio Académico' },
];
// ============================================================
// UI Utilities
// ============================================================
function switchPanel(section) {
    panels.forEach((panel) => panel.classList.toggle('hidden', panel.id !== `panel-${section}`));
    navButtons.forEach((button) => button.classList.toggle('active', button.dataset.section === section));
    if (section === 'dashboard') {
        refreshDashboard();
    }
    if (section === 'convocatorias') {
        refreshConvocatorias();
    }
    if (section === 'directores') {
        refreshDirectores();
    }
    if (section === 'notas') {
        refreshNotas();
    }
    if (section === 'cronograma') {
        refreshCronograma();
    }
}
function formatMoney(value) {
    return value.toLocaleString('es-EC', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}
function tagsByEstado(estado) {
    switch (estado) {
        case 'registrada': return '<span class="tag registered">Registrada</span>';
        case 'en revisión': return '<span class="tag review">En Revisión</span>';
        case 'aprobada': return '<span class="tag approved">Aprobada</span>';
        case 'rechazada': return '<span class="tag">Rechazada</span>';
        default: return `<span class="tag">${estado}</span>`;
    }
}
function showNotification(message, type = 'info') {
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
function createId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `id-${Math.random().toString(36).slice(2, 10)}`;
}
function createElementFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
}
// ============================================================
// API Utilities
// ============================================================
async function fetchJson(path, options) {
    try {
        const response = await fetch(path, { cache: 'no-store', ...options });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.mensaje || response.statusText);
        }
        return (await response.json());
    }
    catch (error) {
        console.error('Fetch error', path, error);
        showNotification(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
        return null;
    }
}
async function postJson(path, data) {
    return fetchJson(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}
async function patchJson(path, data) {
    return fetchJson(path, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}
async function loadInitialData() {
    if (catalogosData && departamentosData.length > 0 && provinciasData.length > 0) {
        return;
    }
    const [catalogosRes, departamentosRes, ubicacionesRes] = await Promise.all([
        fetchJson('/api/catalogos'),
        fetchJson('/api/departamentos-carreras'),
        fetchJson('/api/ubicaciones'),
    ]);
    if (catalogosRes?.exito && catalogosRes.datos) {
        catalogosData = catalogosRes.datos;
    }
    if (departamentosRes?.exito && departamentosRes.datos) {
        departamentosData = departamentosRes.datos;
    }
    if (ubicacionesRes?.exito && ubicacionesRes.datos) {
        provinciasData = ubicacionesRes.datos;
    }
}
// ============================================================
// Dashboard & Statistics
// ============================================================
function buildNotesTable(notas) {
    notesTableBody.innerHTML = notas
        .map((nota) => `
    <tr data-codigo="${nota.codigo}">
      <td><strong>${nota.codigo}</strong></td>
      <td>${nota.nombreProyecto}<br><small>${nota.sede}</small></td>
      <td>${tagsByEstado(nota.estado)}</td>
      <td>${formatMoney(nota.presupuesto)}</td>
      <td><button class="table-action" onclick="viewNoteDetail('${nota.codigo}')">Ver Detalle</button></td>
    </tr>
  `)
        .join('');
}
async function refreshDashboard() {
    const notas = await fetchJson('/api/notas?limite=100');
    const stats = await fetchJson('/api/estadisticas/presupuesto-general');
    if (!notas || !notas.exito || !notas.datos) {
        panelSummary.textContent = 'No se pudieron cargar las notas.';
        return;
    }
    const notasDatos = notas.datos;
    const listaNotas = notasDatos.datos.map((nota) => ({
        codigo: nota.codigo,
        nombreProyecto: nota.nombreProyecto,
        sede: nota.sedeUnidadAcademica,
        estado: nota.estado,
        presupuesto: nota.presupuesto.items.reduce((sum, item) => sum + item.total, 0),
    }));
    buildNotesTable(listaNotas);
    if (stats && stats.exito && stats.datos) {
        statNotas.textContent = String(notasDatos.paginacion.totalRegistros);
        statPresupuesto.textContent = formatMoney(stats.datos.presupuestoTotal);
        statPromedio.textContent = formatMoney(stats.datos.promedioPorNota);
    }
    panelSummary.textContent = `${listaNotas.length} notas conceptuales cargadas.`;
}
// ============================================================
// List Views
// ============================================================
function buildList(container, items) {
    container.innerHTML = items
        .map((item) => `
    <div class="list-item">
      <div><strong>${item.title}</strong><span>${item.subtitle}</span></div>
    </div>
  `)
        .join('');
}
async function refreshConvocatorias() {
    const conv = await fetchJson('/api/convocatorias');
    if (!conv || !conv.exito || !conv.datos) {
        convocatoriasList.innerHTML = '<p style="color: #ef4444;">Error al cargar convocatorias</p>';
        return;
    }
    buildList(convocatoriasList, conv.datos.map((item) => ({ title: `Convocatoria ${item.anio}`, subtitle: `Estado: ${item.estado}` })));
}
async function refreshDirectores() {
    const data = await fetchJson('/api/directores');
    if (!data || !data.exito || !data.datos) {
        directoresList.innerHTML = '<p style="color: #ef4444;">Error al cargar directores</p>';
        return;
    }
    buildList(directoresList, data.datos.map((item) => ({ title: item.nombre, subtitle: `${item.correo} · ${item.telefono}` })));
}
async function refreshNotas() {
    const notas = await fetchJson('/api/notas?limite=100');
    if (!notas || !notas.exito || !notas.datos) {
        notasList.innerHTML = '<p style="color: #ef4444;">Error al cargar notas</p>';
        return;
    }
    buildList(notasList, notas.datos.datos.map((nota) => ({ title: nota.codigo, subtitle: `${nota.nombreProyecto} · ${nota.estado}` })));
}
// ============================================================
// Note Detail View & Management
// ============================================================
async function viewNoteDetail(codigo) {
    const nota = await fetchJson(`/api/notas/${codigo}`);
    if (!nota || !nota.exito || !nota.datos) {
        showNotification('No se pudo cargar la nota', 'error');
        return;
    }
    const d = nota.datos;
    const totalBudget = d.presupuesto.items.reduce((s, item) => s + item.total, 0);
    const detailHtml = `
    <div class="modal-overlay" id="note-detail-modal">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h2>${d.codigo}</h2>
            <p>${d.nombreProyecto}</p>
          </div>
          <button class="close-button" data-close="modal">✕</button>
        </div>

        <div class="grid-2">
          <div class="panel-card">
            <p class="panel-label">Estado</p>
            <p>${tagsByEstado(d.estado)}</p>
          </div>
          <div class="panel-card">
            <p class="panel-label">Presupuesto Total</p>
            <p>${formatMoney(totalBudget)}</p>
          </div>
        </div>

        <section class="modal-section">
          <h3>Información General</h3>
          <div class="panel-card">
            <p><strong>Sede:</strong> ${d.sedeUnidadAcademica}</p>
            <p><strong>Departamento:</strong> ${d.departamento}</p>
            <p><strong>Cobertura:</strong> ${d.localizacion.cobertura}</p>
            <p><strong>Ubicación:</strong> ${d.localizacion.detalleUbicacion}</p>
            <p><strong>Población Objetivo:</strong> ${d.caracterizacionPoblacion.poblacionObjetivo} de ${d.caracterizacionPoblacion.poblacionReferencia}</p>
          </div>
        </section>

        <section class="modal-section">
          <h3>Presupuesto</h3>
          <div class="table-wrapper">
            <table class="budget-table">
              <thead>
                <tr><th>Descripción</th><th>Cantidad</th><th>Valor Unitario</th><th>Total</th></tr>
              </thead>
              <tbody>
                ${d.presupuesto.items
        .map((item) => `
                  <tr>
                    <td>${item.descripcion}</td>
                    <td>${item.cantidad}</td>
                    <td>${formatMoney(item.valorUnitario)}</td>
                    <td>${formatMoney(item.total)}</td>
                  </tr>
                `)
        .join('')}
                <tr class="budget-footer">
                  <td colspan="3">Aporte Entidad Auspiciante</td>
                  <td>${formatMoney(d.presupuesto.aporteEntidadAuspiciante)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="modal-section">
          <h3>Cronograma</h3>
          <div class="table-wrapper">
            <table class="cronograma-table">
              <thead>
                <tr><th>Actividad</th><th>Inicio</th><th>Fin</th><th>Responsable</th></tr>
              </thead>
              <tbody>
                ${d.cronograma
        .map((act) => `
                  <tr>
                    <td>${act.descripcion}</td>
                    <td>${new Date(act.fechaInicio).toLocaleDateString('es-EC')}</td>
                    <td>${new Date(act.fechaFin).toLocaleDateString('es-EC')}</td>
                    <td>${act.responsable}</td>
                  </tr>
                `)
        .join('')}
              </tbody>
            </table>
          </div>
        </section>

        <section class="modal-section modal-actions">
          <select id="status-select">
            <option value="">Cambiar Estado</option>
            <option value="registrada">Registrada</option>
            <option value="en revisión">En Revisión</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
          </select>
          <button id="update-status-button" class="primary-button">Actualizar Estado</button>
        </section>
      </div>
    </div>
  `;
    document.body.insertAdjacentHTML('beforeend', detailHtml);
    const modal = document.getElementById('note-detail-modal');
    const closeButton = modal?.querySelector('[data-close="modal"]');
    closeButton?.addEventListener('click', () => modal?.remove());
    modal?.addEventListener('click', (event) => {
        if (event.target === modal)
            modal.remove();
    });
    document.getElementById('update-status-button')?.addEventListener('click', async () => {
        const statusSelect = document.getElementById('status-select');
        if (!statusSelect)
            return;
        const estado = statusSelect.value;
        if (!estado) {
            showNotification('Seleccione un estado válido.', 'info');
            return;
        }
        const result = await patchJson(`/api/notas/${codigo}/estado`, { estado });
        if (result && result.exito) {
            showNotification(`Estado actualizado a '${estado}'.`, 'success');
            modal?.remove();
            refreshDashboard();
            refreshNotas();
        }
    });
}
async function searchNoteByCode() {
    const codigo = searchCodeInput?.value.trim();
    if (!codigo) {
        showNotification('Ingrese un código de nota para buscar.', 'info');
        return;
    }
    const nota = await fetchJson(`/api/notas/${codigo}`);
    if (!nota || !nota.exito) {
        showNotification(`Nota '${codigo}' no encontrada.`, 'error');
        return;
    }
    viewNoteDetail(codigo);
}
async function refreshCronograma() {
    const notasSummary = await fetchJson('/api/notas?limite=100');
    if (!notasSummary || !notasSummary.exito || !notasSummary.datos) {
        cronogramaPanel.innerHTML = '<p style="color: #ef4444;">No se pudo cargar el cronograma.</p>';
        return;
    }
    const detallesResponses = await Promise.all(notasSummary.datos.datos.map((nota) => fetchJson(`/api/notas/${nota.codigo}`)));
    const actividades = detallesResponses
        .filter((response) => !!response && response.exito && !!response.datos)
        .flatMap((response) => response.datos.cronograma.map((actividad) => ({
        codigo: response.datos.codigo,
        nombreProyecto: response.datos.nombreProyecto,
        actividad,
    })));
    if (actividades.length === 0) {
        cronogramaPanel.innerHTML = '<p>No hay actividades registradas en el cronograma.</p>';
        return;
    }
    cronogramaPanel.innerHTML = `
    <div class="table-wrapper">
      <table class="cronograma-table">
        <thead>
          <tr>
            <th>Nota</th>
            <th>Actividad</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Responsable</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          ${actividades
        .map((item) => `
                <tr>
                  <td>${item.codigo}</td>
                  <td>${item.actividad.descripcion}</td>
                  <td>${new Date(item.actividad.fechaInicio).toLocaleDateString('es-EC')}</td>
                  <td>${new Date(item.actividad.fechaFin).toLocaleDateString('es-EC')}</td>
                  <td>${item.actividad.responsable}</td>
                  <td><button class="table-action" data-update="${item.codigo}|${item.actividad.id}">Editar</button></td>
                </tr>
              `)
        .join('')}
        </tbody>
      </table>
    </div>
  `;
    cronogramaPanel.querySelectorAll('[data-update]').forEach((button) => {
        button.addEventListener('click', async () => {
            const [codigo, actividadId] = button.dataset.update.split('|');
            if (!codigo || !actividadId)
                return;
            await editActividadCronograma(codigo, actividadId);
        });
    });
}
async function editActividadCronograma(codigo, actividadId) {
    const notaDetalle = await fetchJson(`/api/notas/${codigo}`);
    if (!notaDetalle || !notaDetalle.exito || !notaDetalle.datos) {
        showNotification('No fue posible cargar los datos de la nota.', 'error');
        return;
    }
    const actividad = notaDetalle.datos.cronograma.find((item) => item.id === actividadId);
    if (!actividad) {
        showNotification('Actividad no encontrada.', 'error');
        return;
    }
    const editHtml = `
    <div class="modal-overlay" id="cronograma-edit-modal">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h2>Editar actividad</h2>
            <p>${codigo}</p>
          </div>
          <button class="close-button" data-close="modal">✕</button>
        </div>

        <div class="field-grid">
          <label class="form-field"><span>Actividad</span><input id="edit-actividad-descripcion" type="text" value="${actividad.descripcion}" /></label>
          <label class="form-field"><span>Fecha inicio</span><input id="edit-actividad-inicio" type="date" value="${actividad.fechaInicio.slice(0, 10)}" /></label>
          <label class="form-field"><span>Fecha fin</span><input id="edit-actividad-fin" type="date" value="${actividad.fechaFin.slice(0, 10)}" /></label>
          <label class="form-field"><span>Responsable</span><input id="edit-actividad-responsable" type="text" value="${actividad.responsable}" /></label>
        </div>

        <div class="modal-actions">
          <button id="save-actividad-button" class="primary-button">Guardar cambios</button>
        </div>
      </div>
    </div>
  `;
    document.body.insertAdjacentHTML('beforeend', editHtml);
    const modal = document.getElementById('cronograma-edit-modal');
    const closeButton = modal?.querySelector('[data-close="modal"]');
    closeButton?.addEventListener('click', () => modal?.remove());
    modal?.addEventListener('click', (event) => {
        if (event.target === modal)
            modal.remove();
    });
    document.getElementById('save-actividad-button')?.addEventListener('click', async () => {
        const descripcion = document.getElementById('edit-actividad-descripcion').value.trim();
        const fechaInicio = document.getElementById('edit-actividad-inicio').value;
        const fechaFin = document.getElementById('edit-actividad-fin').value;
        const responsable = document.getElementById('edit-actividad-responsable').value.trim();
        if (!descripcion || !fechaInicio || !fechaFin) {
            showNotification('Complete la descripción y las fechas.', 'error');
            return;
        }
        const nuevasActividades = notaDetalle.datos.cronograma.map((item) => item.id === actividadId ? { ...item, descripcion, fechaInicio, fechaFin, responsable } : item);
        const result = await patchJson(`/api/notas/${codigo}`, { cronograma: nuevasActividades });
        if (result && result.exito) {
            showNotification('Actividad actualizada correctamente.', 'success');
            modal?.remove();
            refreshCronograma();
        }
    });
}
// ============================================================
// Note Creation Form
// ============================================================
async function openNoteForm() {
    await loadInitialData();
    const departamentosHtml = departamentosData
        .map((dep) => `
      <div class="checkbox-group">
        <label><input type="checkbox" name="departamento" value="${dep.id}" /> ${dep.nombre}</label>
        <div class="subcheckboxes">
          ${dep.carreras
        .map((car) => `<label><input type="checkbox" name="carrera" value="${car.id}" data-departamento-id="${dep.id}" /> ${car.nombre}</label>`)
        .join('')}
        </div>
      </div>
    `)
        .join('');
    const sedesOptions = SEDES.map((sede) => `<option value="${sede}">${sede}</option>`).join('');
    const departmentOptions = departamentosData.map((dep) => `<option value="${dep.id}">${dep.nombre}</option>`).join('');
    const provinciasOptions = provinciasData.map((prov) => `<option value="${prov.id}">${prov.nombre}</option>`).join('');
    const alignmentPageSize = 3;
    let currentAlignmentPage = 0;
    const alignmentHtml = () => {
        const start = currentAlignmentPage * alignmentPageSize;
        const pageItems = ALINEAMIENTO_GRUPOS.slice(start, start + alignmentPageSize);
        return pageItems
            .map((group) => {
            const items = catalogosData?.[group.key] ?? [];
            return `
          <section class="alignment-table">
            <h4>${group.label}</h4>
            <div class="checkbox-options">
              ${items.map((item) => `<label><input type="checkbox" name="alineamiento-${group.key}" value="${item}" /> ${item}</label>`).join('')}
            </div>
          </section>
        `;
        })
            .join('');
    };
    const modalHtml = `
    <div class="modal-overlay" id="note-form-modal">
      <div class="modal-content note-form-modal">
        <div class="modal-header">
          <div>
            <h2>Registrar Nota Conceptual</h2>
            <p>Captura los datos generales y la información de sostenibilidad.</p>
          </div>
          <button class="close-button" data-close="modal">✕</button>
        </div>

        <div class="modal-section">
          <h3>Datos Generales</h3>
          <div class="field-grid">
            <label class="form-field"><span>Nombre del proyecto</span><input id="nota-nombre" type="text" placeholder="Nombre del proyecto" /></label>
            <label class="form-field"><span>Convocatoria</span><select id="nota-convocatoria"></select></label>
            <label class="form-field"><span>Sede / Unidad Académica</span><select id="nota-sede">${sedesOptions}</select></label>
            <label class="form-field"><span>Departamento</span><select id="nota-departamento">${departmentOptions}</select></label>
            <label class="form-field"><span>Director</span><select id="nota-director"></select></label>
            <label class="form-field"><span>Fecha inicio</span><input id="nota-fecha-inicio" type="date" /></label>
            <label class="form-field"><span>Fecha fin</span><input id="nota-fecha-fin" type="date" /></label>
          </div>
        </div>

        <div class="modal-section">
          <h3>Localización Geográfica</h3>
          <div class="field-grid">
            <label class="form-field"><span>Provincia</span><select id="ubicacion-provincia"><option value="">Seleccione provincia</option>${provinciasOptions}</select></label>
            <label class="form-field"><span>Cantón</span><select id="ubicacion-canton" disabled><option value="">Seleccione cantón</option></select></label>
            <label class="form-field"><span>Parroquia</span><select id="ubicacion-parroquia" disabled><option value="">Seleccione parroquia</option></select></label>
            <label class="form-field"><span>Detalle de ubicación</span><textarea id="ubicacion-detalle" placeholder="Descripción específica"></textarea></label>
          </div>
        </div>

        <div class="modal-section">
          <h3>Sector de Población</h3>
          <div class="checkbox-grid">
            <label><input type="checkbox" id="poblacion-urbanoMarginal" /> Urbano marginal</label>
            <label><input type="checkbox" id="poblacion-rural" /> Rural</label>
            <label><input type="checkbox" id="poblacion-grupoAtencionPrioritaria" /> Grupo de atención prioritaria</label>
          </div>
        </div>

        <div class="modal-section">
          <h3>Alineamiento</h3>
          <div id="alignment-container" class="alignment-container">${alignmentHtml()}</div>
          <div class="alignment-actions">
            <button id="alignment-prev" class="secondary-button" type="button">Anterior</button>
            <button id="alignment-next" class="secondary-button" type="button">Siguiente</button>
          </div>
        </div>

        <div class="modal-section">
          <h3>Departamentos y Carreras Participantes</h3>
          <div class="departamentos-grid">${departamentosHtml}</div>
        </div>

        <div class="modal-section">
          <h3>Impactos Esperados</h3>
          <div class="field-grid">
            <label class="form-field"><span>Económico</span><textarea id="impacto-economico"></textarea></label>
            <label class="form-field"><span>Social</span><textarea id="impacto-social"></textarea></label>
            <label class="form-field"><span>Político</span><textarea id="impacto-politico"></textarea></label>
            <label class="form-field"><span>Científico</span><textarea id="impacto-cientifico"></textarea></label>
            <label class="form-field"><span>Ambiental</span><textarea id="impacto-ambiental"></textarea></label>
            <label class="form-field"><span>Otros</span><textarea id="impacto-otros"></textarea></label>
          </div>
        </div>

        <div class="modal-section">
          <h3>Caracterización de Población</h3>
          <div class="field-grid">
            <label class="form-field"><span>Población de referencia</span><input id="poblacion-referencia" type="number" min="0" /></label>
            <label class="form-field"><span>Población potencial</span><input id="poblacion-potencial" type="number" min="0" /></label>
            <label class="form-field"><span>Población objetivo</span><input id="poblacion-objetivo" type="number" min="0" /></label>
          </div>
        </div>

        <div class="modal-section">
          <h3>Presupuesto</h3>
          <div id="budget-rows" class="budget-rows"></div>
          <button id="add-budget-row" type="button" class="secondary-button">Agregar ítem de presupuesto</button>
        </div>

        <div class="modal-section">
          <h3>Cronograma de Ejecución</h3>
          <div id="schedule-rows" class="budget-rows"></div>
          <button id="add-schedule-row" type="button" class="secondary-button">Agregar actividad</button>
        </div>

        <div class="modal-section">
          <h3>Firmas de Responsabilidad</h3>
          <div class="field-grid">
            <label class="form-field"><span>Director de nota</span><input id="firma-directorNota" type="text" /></label>
            <label class="form-field"><span>Director de carrera</span><input id="firma-directorCarrera" type="text" /></label>
            <label class="form-field"><span>Coordinador de vinculación</span><input id="firma-coordinadorVinculacion" type="text" /></label>
            <label class="form-field"><span>Director de departamento</span><input id="firma-directorDepartamento" type="text" /></label>
          </div>
        </div>

        <div class="modal-actions modal-section">
          <button id="save-note-button" class="primary-button">Guardar Nota Conceptual</button>
        </div>
      </div>
    </div>
  `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.classList.add('modal-open');
    const modal = document.getElementById('note-form-modal');
    const closeButton = modal?.querySelector('[data-close="modal"]');
    const removeModal = () => {
        modal?.remove();
        document.body.classList.remove('modal-open');
    };
    closeButton?.addEventListener('click', removeModal);
    modal?.addEventListener('click', (event) => {
        if (event.target === modal)
            removeModal();
    });
    const convocatoriaSelect = document.getElementById('nota-convocatoria');
    const directorSelect = document.getElementById('nota-director');
    const provinciaSelect = document.getElementById('ubicacion-provincia');
    const cantonSelect = document.getElementById('ubicacion-canton');
    const parroquiaSelect = document.getElementById('ubicacion-parroquia');
    const alignmentContainer = document.getElementById('alignment-container');
    const addBudgetRowButton = document.getElementById('add-budget-row');
    const addScheduleRowButton = document.getElementById('add-schedule-row');
    const saveNoteButton = document.getElementById('save-note-button');
    const alignmentPrevButton = document.getElementById('alignment-prev');
    const alignmentNextButton = document.getElementById('alignment-next');
    const directoresRes = await fetchJson('/api/directores');
    const convocatoriasRes = await fetchJson('/api/convocatorias');
    if (convocatoriasRes?.exito && convocatoriasRes.datos) {
        convocatoriaSelect.innerHTML = `<option value="">Seleccione convocatoria</option>${convocatoriasRes.datos
            .map((item) => `<option value="${item.id}">Convocatoria ${item.anio} (${item.estado})</option>`)
            .join('')}`;
    }
    if (directoresRes?.exito && directoresRes.datos) {
        directorSelect.innerHTML = `<option value="">Seleccione director</option>${directoresRes.datos
            .map((item) => `<option value="${item.id}">${item.nombre} - ${item.correo}</option>`)
            .join('')}`;
    }
    function renderAlignment() {
        alignmentContainer.innerHTML = alignmentHtml();
    }
    alignmentPrevButton?.addEventListener('click', () => {
        currentAlignmentPage = Math.max(0, currentAlignmentPage - 1);
        renderAlignment();
    });
    alignmentNextButton?.addEventListener('click', () => {
        currentAlignmentPage = Math.min(Math.ceil(ALINEAMIENTO_GRUPOS.length / alignmentPageSize) - 1, currentAlignmentPage + 1);
        renderAlignment();
    });
    provinciaSelect?.addEventListener('change', async () => {
        cantonSelect.disabled = true;
        parroquiaSelect.disabled = true;
        cantonSelect.innerHTML = '<option value="">Cargando...</option>';
        parroquiaSelect.innerHTML = '<option value="">Seleccione parroquia</option>';
        const provinciaId = provinciaSelect.value;
        if (!provinciaId) {
            cantonSelect.innerHTML = '<option value="">Seleccione cantón</option>';
            return;
        }
        const provinciaDetalle = await fetchJson(`/api/ubicaciones?provinciaId=${encodeURIComponent(provinciaId)}`);
        if (!provinciaDetalle || !provinciaDetalle.exito || !provinciaDetalle.datos) {
            showNotification('Error al cargar cantones.', 'error');
            return;
        }
        cantonSelect.disabled = false;
        cantonSelect.innerHTML = `<option value="">Seleccione cantón</option>${provinciaDetalle.datos.cantones
            .map((canton) => `<option value="${canton.id}">${canton.nombre}</option>`)
            .join('')}`;
    });
    cantonSelect?.addEventListener('change', async () => {
        parroquiaSelect.disabled = true;
        parroquiaSelect.innerHTML = '<option value="">Cargando...</option>';
        const provinciaId = provinciaSelect.value;
        const cantonId = cantonSelect.value;
        if (!provinciaId || !cantonId) {
            parroquiaSelect.innerHTML = '<option value="">Seleccione parroquia</option>';
            return;
        }
        const parroquiasRes = await fetchJson(`/api/ubicaciones?provinciaId=${encodeURIComponent(provinciaId)}&cantonId=${encodeURIComponent(cantonId)}`);
        if (!parroquiasRes || !parroquiasRes.exito || !parroquiasRes.datos) {
            showNotification('Error al cargar parroquias.', 'error');
            return;
        }
        parroquiaSelect.disabled = false;
        parroquiaSelect.innerHTML = `<option value="">Seleccione parroquia</option>${parroquiasRes.datos.parroquias
            .map((parroquia) => `<option value="${parroquia.id}">${parroquia.nombre}</option>`)
            .join('')}`;
    });
    function addBudgetRow() {
        const wrapper = document.createElement('div');
        wrapper.className = 'budget-row';
        wrapper.innerHTML = `
      <div class="field-grid">
        <label class="form-field"><span>Descripción</span><input type="text" class="budget-description" placeholder="Descripción del ítem" /></label>
        <label class="form-field"><span>Cantidad</span><input type="number" class="budget-quantity" min="1" value="1" /></label>
        <label class="form-field"><span>Valor unitario</span><input type="number" class="budget-price" min="0" step="0.01" value="0" /></label>
        <label class="form-field"><span>Total</span><input class="budget-total" type="text" readonly value="$0.00" /></label>
      </div>
      <button type="button" class="remove-row secondary-button">Eliminar ítem</button>
    `;
        const quantityInput = wrapper.querySelector('.budget-quantity');
        const priceInput = wrapper.querySelector('.budget-price');
        const totalInput = wrapper.querySelector('.budget-total');
        const removeButton = wrapper.querySelector('.remove-row');
        const updateTotal = () => {
            const quantity = Number(quantityInput.value) || 0;
            const price = Number(priceInput.value) || 0;
            const total = quantity * price;
            totalInput.value = formatMoney(total);
        };
        quantityInput.addEventListener('input', updateTotal);
        priceInput.addEventListener('input', updateTotal);
        removeButton.addEventListener('click', () => wrapper.remove());
        const budgetRows = document.getElementById('budget-rows');
        budgetRows?.appendChild(wrapper);
        updateTotal();
    }
    function addScheduleRow() {
        const wrapper = document.createElement('div');
        wrapper.className = 'budget-row';
        wrapper.innerHTML = `
      <div class="field-grid">
        <label class="form-field"><span>Actividad</span><input type="text" class="schedule-description" placeholder="Descripción de la actividad" /></label>
        <label class="form-field"><span>Fecha inicio</span><input type="date" class="schedule-start" /></label>
        <label class="form-field"><span>Fecha fin</span><input type="date" class="schedule-end" /></label>
        <label class="form-field"><span>Responsable</span><input type="text" class="schedule-responsable" placeholder="Responsable" /></label>
      </div>
      <button type="button" class="remove-row secondary-button">Eliminar actividad</button>
    `;
        const removeButton = wrapper.querySelector('.remove-row');
        removeButton.addEventListener('click', () => wrapper.remove());
        wrapper.classList.add('schedule-row');
        const scheduleRows = document.getElementById('schedule-rows');
        scheduleRows?.appendChild(wrapper);
    }
    addBudgetRow();
    addScheduleRow();
    addBudgetRowButton?.addEventListener('click', addBudgetRow);
    addScheduleRowButton?.addEventListener('click', addScheduleRow);
    saveNoteButton?.addEventListener('click', async () => {
        const nombreProyecto = document.getElementById('nota-nombre').value.trim();
        const convocatoriaId = document.getElementById('nota-convocatoria').value;
        const sedeUnidadAcademica = document.getElementById('nota-sede').value;
        const departamentoSeleccionado = document.getElementById('nota-departamento').value;
        const directorId = document.getElementById('nota-director').value;
        const fechaInicio = document.getElementById('nota-fecha-inicio').value;
        const fechaFin = document.getElementById('nota-fecha-fin').value;
        const detalleUbicacion = document.getElementById('ubicacion-detalle').value.trim();
        const provincia = document.getElementById('ubicacion-provincia').value;
        const canton = document.getElementById('ubicacion-canton').value;
        const parroquia = document.getElementById('ubicacion-parroquia').value;
        const urbanoMarginal = document.getElementById('poblacion-urbanoMarginal').checked;
        const rural = document.getElementById('poblacion-rural').checked;
        const grupoAtencionPrioritaria = document.getElementById('poblacion-grupoAtencionPrioritaria').checked;
        const impactoEconomico = document.getElementById('impacto-economico').value.trim();
        const impactoSocial = document.getElementById('impacto-social').value.trim();
        const impactoPolitico = document.getElementById('impacto-politico').value.trim();
        const impactoCientifico = document.getElementById('impacto-cientifico').value.trim();
        const impactoAmbiental = document.getElementById('impacto-ambiental').value.trim();
        const impactoOtros = document.getElementById('impacto-otros').value.trim();
        const poblacionReferencia = Number(document.getElementById('poblacion-referencia').value);
        const poblacionPotencial = Number(document.getElementById('poblacion-potencial').value);
        const poblacionObjetivo = Number(document.getElementById('poblacion-objetivo').value);
        const firmaDirectorNota = document.getElementById('firma-directorNota').value.trim();
        const firmaDirectorCarrera = document.getElementById('firma-directorCarrera').value.trim();
        const firmaCoordinadorVinculacion = document.getElementById('firma-coordinadorVinculacion').value.trim();
        const firmaDirectorDepartamento = document.getElementById('firma-directorDepartamento').value.trim();
        const departamentosParticipantes = Array.from(document.querySelectorAll('input[name="departamento"]:checked')).map((input) => input.value);
        const carrerasParticipantes = Array.from(document.querySelectorAll('input[name="carrera"]:checked')).map((input) => input.value);
        const alineamientoSeleccionado = {};
        ALINEAMIENTO_GRUPOS.forEach((group) => {
            const valores = Array.from(document.querySelectorAll(`input[name="alineamiento-${group.key}"]:checked`)).map((input) => input.value);
            alineamientoSeleccionado[group.key] = valores;
        });
        const presupuestoItems = Array.from(document.querySelectorAll('.budget-row')).map((row) => {
            const descripcion = row.querySelector('.budget-description').value.trim();
            const cantidad = Number(row.querySelector('.budget-quantity').value);
            const valorUnitario = Number(row.querySelector('.budget-price').value);
            const total = Math.round(cantidad * valorUnitario * 100) / 100;
            return { id: createId(), descripcion, cantidad, valorUnitario, total };
        });
        const cronograma = Array.from(document.querySelectorAll('.schedule-row')).map((row) => {
            const descripcion = row.querySelector('.schedule-description').value.trim();
            const fechaInicio = row.querySelector('.schedule-start').value;
            const fechaFin = row.querySelector('.schedule-end').value;
            const responsable = row.querySelector('.schedule-responsable').value.trim();
            return { id: createId(), descripcion, fechaInicio, fechaFin, responsable };
        });
        const notaPayload = {
            nombreProyecto,
            convocatoriaId,
            sedeUnidadAcademica: sedeUnidadAcademica || '',
            departamento: departamentoSeleccionado || '',
            directorId,
            plazoEjecucion: { fechaInicio, fechaFin },
            localizacion: {
                cobertura: 'Provincial',
                provincia,
                canton,
                parroquia,
                detalleUbicacion,
            },
            sectorPoblacion: { urbanoMarginal, rural, grupoAtencionPrioritaria },
            alineamiento: alineamientoSeleccionado,
            departamentosParticipantes,
            carrerasParticipantes,
            impactosEsperados: {
                economico: impactoEconomico,
                social: impactoSocial,
                politico: impactoPolitico,
                cientifico: impactoCientifico,
                ambiental: impactoAmbiental,
                otros: impactoOtros,
            },
            caracterizacionPoblacion: {
                poblacionReferencia,
                poblacionPotencial,
                poblacionObjetivo,
            },
            presupuesto: { items: presupuestoItems, aporteEntidadAuspiciante: 0 },
            cronograma,
            firmasResponsabilidad: {
                directorNota: firmaDirectorNota,
                directorCarrera: firmaDirectorCarrera,
                coordinadorVinculacion: firmaCoordinadorVinculacion,
                directorDepartamento: firmaDirectorDepartamento,
            },
        };
        const result = await postJson('/api/notas', notaPayload);
        if (!result)
            return;
        if (!result.exito) {
            showNotification(`No se pudo guardar la nota: ${result.mensaje}`, 'error');
            return;
        }
        showNotification('Nota conceptual registrada correctamente.', 'success');
        modal?.remove();
        refreshDashboard();
        refreshNotas();
    });
}
// ============================================================
// Event Listeners
// ============================================================
navButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const section = button.dataset.section;
        if (!section)
            return;
        switchPanel(section);
    });
});
searchButton?.addEventListener('click', searchNoteByCode);
searchCodeInput?.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchNoteByCode();
    }
});
openNoteFormButton?.addEventListener('click', openNoteForm);
newNoteButton?.addEventListener('click', openNoteForm);
const saveConvocatoriaButton = document.getElementById('save-convocatoria');
const saveDirectorButton = document.getElementById('save-director');
async function saveConvocatoria() {
    const yearInput = document.getElementById('convocatoria-year');
    const statusSelect = document.getElementById('convocatoria-status');
    const anio = Number(yearInput.value);
    const estado = statusSelect.value;
    if (!anio || anio < 2020) {
        showNotification('Ingrese un año válido para la convocatoria.', 'error');
        return;
    }
    const result = await postJson('/api/convocatorias', { anio, estado });
    if (!result)
        return;
    if (!result.exito) {
        showNotification(result.mensaje, 'error');
        return;
    }
    showNotification('Convocatoria registrada correctamente.', 'success');
    yearInput.value = '';
    statusSelect.value = 'activa';
    refreshConvocatorias();
}
async function saveDirector() {
    const nameInput = document.getElementById('director-name');
    const emailInput = document.getElementById('director-email');
    const phoneInput = document.getElementById('director-phone');
    const nombre = nameInput.value.trim();
    const correo = emailInput.value.trim();
    const telefono = phoneInput.value.trim();
    if (!nombre) {
        showNotification('El nombre del director es obligatorio.', 'error');
        return;
    }
    if (!correo.includes('@')) {
        showNotification('El correo debe contener @.', 'error');
        return;
    }
    if (!telefono) {
        showNotification('El teléfono del director es obligatorio.', 'error');
        return;
    }
    const result = await postJson('/api/directores', { nombre, correo, telefono });
    if (!result)
        return;
    if (!result.exito) {
        showNotification(result.mensaje, 'error');
        return;
    }
    showNotification('Director registrado correctamente.', 'success');
    nameInput.value = '';
    emailInput.value = '';
    phoneInput.value = '';
    refreshDirectores();
}
saveConvocatoriaButton?.addEventListener('click', saveConvocatoria);
saveDirectorButton?.addEventListener('click', saveDirector);
// ============================================================
// Initialize
// ============================================================
refreshDashboard();
