"use strict";
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
function switchPanel(section) {
    panels.forEach((panel) => panel.classList.toggle('hidden', panel.id !== `panel-${section}`));
    navButtons.forEach((button) => button.classList.toggle('active', button.dataset.section === section));
}
function formatMoney(value) {
    return value.toLocaleString('es-EC', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}
function tagsByEstado(estado) {
    switch (estado) {
        case 'registrada': return '<span class="tag registered">Registrada</span>';
        case 'en revisión': return '<span class="tag review">En Revisión</span>';
        case 'aprobada': return '<span class="tag approved">Aprobada</span>';
        default: return `<span class="tag">${estado}</span>`;
    }
}
async function fetchJson(path) {
    try {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok)
            throw new Error(response.statusText);
        return (await response.json());
    }
    catch (error) {
        console.error('Fetch error', path, error);
        return null;
    }
}
function buildNotesTable(notas) {
    notesTableBody.innerHTML = notas.map((nota) => `
    <tr>
      <td><strong>${nota.codigo}</strong></td>
      <td>${nota.nombreProyecto}<br><small>${nota.sede}</small></td>
      <td>${tagsByEstado(nota.estado)}</td>
      <td>${formatMoney(nota.presupuesto)}</td>
      <td><button class="table-action">Ver Detalle</button></td>
    </tr>
  `).join('');
}
function buildList(container, items) {
    container.innerHTML = items.map((item) => {
        const parts = item.split('|');
        return `
      <div class="list-item">
        <div><strong>${parts[0]}</strong><span>${parts[1] ?? ''}</span></div>
      </div>
    `;
    }).join('');
}
async function refreshDashboard() {
    const notas = await fetchJson('/api/notas');
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
    const totalNotas = listaNotas.length;
    const totalPresupuesto = listaNotas.reduce((sum, nota) => sum + nota.presupuesto, 0);
    const promedio = totalNotas > 0 ? totalPresupuesto / totalNotas : 0;
    statNotas.textContent = String(totalNotas);
    statPresupuesto.textContent = formatMoney(totalPresupuesto);
    statPromedio.textContent = formatMoney(promedio);
    panelSummary.textContent = `${totalNotas} notas conceptuales cargadas.`;
}
async function refreshConvocatorias() {
    const conv = await fetchJson('/api/convocatorias');
    if (!conv || !conv.exito) {
        convocatoriasList.textContent = 'No se pudieron cargar las convocatorias.';
        return;
    }
    buildList(convocatoriasList, conv.datos.map((item) => [`Convocatoria ${item.anio}`, `Estado: ${item.estado}`].join('|')));
}
async function refreshDirectores() {
    const data = await fetchJson('/api/directores');
    if (!data || !data.exito) {
        directoresList.textContent = 'No se pudieron cargar los directores.';
        return;
    }
    buildList(directoresList, data.datos.map((item) => [`${item.nombre}`, `${item.correo} · ${item.telefono}`].join('|')));
}
async function refreshNotas() {
    const notas = await fetchJson('/api/notas');
    if (!notas || !notas.exito) {
        notasList.textContent = 'No se pudieron cargar las notas.';
        return;
    }
    buildList(notasList, notas.datos.datos.map((nota) => [`${nota.codigo}`, `${nota.nombreProyecto} · ${nota.estado}`].join('|')));
}
navButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const section = button.dataset.section;
        if (!section)
            return;
        switchPanel(section);
        if (section === 'dashboard')
            refreshDashboard();
        if (section === 'convocatorias')
            refreshConvocatorias();
        if (section === 'directores')
            refreshDirectores();
        if (section === 'notas')
            refreshNotas();
    });
});
document.getElementById('new-note')?.addEventListener('click', () => {
    alert('Funcionalidad de nueva nota aún no implementada.');
});
refreshDashboard();
