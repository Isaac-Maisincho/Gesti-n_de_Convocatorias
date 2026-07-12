'use client';

import { useState, useEffect } from 'react';
import type {
  Convocatoria,
  Director,
  NotaConceptual,
  Departamento,
  Provincia,
  Canton,
  Parroquia,
  NivelCobertura,
  ItemPresupuesto,
  ActividadCronograma,
  EstadoNota
} from '@/models/interfaces';

export default function Dashboard() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'convocatorias' | 'directores' | 'notas'>('dashboard');
  
  // Data State
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [directores, setDirectores] = useState<Director[]>([]);
  const [notas, setNotas] = useState<NotaConceptual[]>([]);
  const [paginacion, setPaginacion] = useState({ paginaActual: 1, totalPaginas: 1, totalRegistros: 0, limite: 5 });
  const [stats, setStats] = useState({ totalBudget: 0, averageBudget: 0, totalNotas: 0, byStatus: { registrada: 0, 'en revisión': 0, aprobada: 0, rechazada: 0 } });
  
  // Catalogs
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [carreras, setCarreras] = useState<{ id: string; nombre: string }[]>([]);
  const [provincias, setProvincias] = useState<{ id: string; nombre: string }[]>([]);
  const [cantones, setCantones] = useState<{ id: string; nombre: string }[]>([]);
  const [parroquias, setParroquias] = useState<Parroquia[]>([]);
  const [catalogos, setCatalogos] = useState<{
    ambitosPrioritarios: string[];
    objetivosODS2030: string[];
    camposCineUnesco: string[];
    objetivosPND: string[];
    objetivosGAD: string[];
    objetivosPlanEstrategico: string[];
    lineasInvestigacion: string[];
    dominioAcademico: string[];
  } | null>(null);

  // Filters for Notas
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState(1);

  // Selected entities for detail modal
  const [selectedNota, setSelectedNota] = useState<NotaConceptual | null>(null);

  // Form states
  const [newConv, setNewConv] = useState({ anio: new Date().getFullYear(), estado: 'activa' as 'activa' | 'inactiva' });
  const [newDirector, setNewDirector] = useState({ nombre: '', correo: '', telefono: '' });
  
  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Wizard state for Note creation
  const [isCreatingNota, setIsCreatingNota] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newNota, setNewNota] = useState({
    convocatoriaId: '',
    nombreProyecto: '',
    sedeUnidadAcademica: 'Matriz Sangolquí',
    departamento: '',
    plazoEjecucion: { fechaInicio: '', fechaFin: '' },
    directorId: '',
    localizacion: {
      cobertura: 'Nacional' as NivelCobertura,
      provincia: '',
      canton: '',
      parroquia: '',
      detalleUbicacion: ''
    },
    sectorPoblacion: {
      urbanoMarginal: false,
      rural: false,
      grupoAtencionPrioritaria: false
    },
    alineamiento: {
      ambitosPrioritarios: [] as string[],
      objetivosODS2030: [] as string[],
      camposCineUnesco: [] as string[],
      objetivosPND: [] as string[],
      objetivosGAD: [] as string[],
      objetivosPlanEstrategico: [] as string[],
      lineasInvestigacion: [] as string[],
      dominioAcademico: [] as string[]
    },
    departamentosParticipantes: [] as string[],
    carrerasParticipantes: [] as string[],
    impactosEsperados: {
      economico: '',
      social: '',
      politico: '',
      cientifico: '',
      ambiental: '',
      otros: ''
    },
    caracterizacionPoblacion: {
      poblacionReferencia: 0,
      poblacionPotencial: 0,
      poblacionObjetivo: 0
    },
    firmasResponsabilidad: {
      directorNota: '',
      directorCarrera: '',
      coordinadorVinculacion: '',
      directorDepartamento: ''
    }
  });

  // Inline forms inside note details
  const [newBudgetItem, setNewBudgetItem] = useState({ descripcion: '', cantidad: 1, valorUnitario: 0 });
  const [newActivityItem, setNewActivityItem] = useState({ descripcion: '', fechaInicio: '', fechaFin: '', responsable: '' });

  // Trigger Toast Notification
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      // Convocatorias
      const resConvs = await fetch('/api/convocatorias');
      const dataConvs = await resConvs.json();
      if (dataConvs.exito) setConvocatorias(dataConvs.datos || []);

      // Directors
      const resDirs = await fetch('/api/directores');
      const dataDirs = await resDirs.json();
      if (dataDirs.exito) setDirectores(dataDirs.datos || []);

      // Stats
      const resStats = await fetch('/api/estadisticas/presupuesto-general');
      const dataStats = await resStats.json();
      if (dataStats.exito) {
        const estadisticas = dataStats.datos ?? {};
        setStats({
          totalBudget: Number(
            estadisticas.sumatoriaGlobal ?? estadisticas.presupuestoGeneral ?? 0
          ),
          averageBudget: Number(
            estadisticas.promedioPorNota ?? estadisticas.promedioPresupuestoPorNota ?? 0
          ),
          totalNotas: Number(estadisticas.totalNotas ?? 0),
          byStatus: {
            registrada: Number(
              estadisticas.distribucionPorEstado?.registrada ?? estadisticas.notasPorEstado?.registrada ?? 0
            ),
            'en revisión': Number(
              estadisticas.distribucionPorEstado?.['en revisión'] ?? estadisticas.notasPorEstado?.['en revisión'] ?? 0
            ),
            aprobada: Number(
              estadisticas.distribucionPorEstado?.aprobada ?? estadisticas.notasPorEstado?.aprobada ?? 0
            ),
            rechazada: Number(
              estadisticas.distribucionPorEstado?.rechazada ?? estadisticas.notasPorEstado?.rechazada ?? 0
            ),
          }
        });
      }

      // Departments & Careers
      const resDepts = await fetch('/api/departamentos-carreras');
      const dataDepts = await resDepts.json();
      if (dataDepts.exito) setDepartamentos(dataDepts.datos || []);

      // Provinces (Locations Level 1)
      const resProv = await fetch('/api/ubicaciones');
      const dataProv = await resProv.json();
      if (dataProv.exito) setProvincias(dataProv.datos || []);

      // Catalogs
      const resCats = await fetch('/api/catalogos');
      const dataCats = await resCats.json();
      if (dataCats.exito) setCatalogos(dataCats.datos);

    } catch (err) {
      console.error(err);
      showToast('Error al conectar con la API del backend.', 'error');
    }
  };

  // Fetch Notes paginated/filtered
  const fetchNotes = async () => {
    try {
      const resNotes = await fetch(`/api/notas?pagina=${currentPage}&limite=5`);
      const dataNotes = await resNotes.json();
      if (dataNotes.exito) {
        const datosRespuesta = dataNotes.datos;
        const listaBase = Array.isArray(datosRespuesta)
          ? datosRespuesta
          : (datosRespuesta && typeof datosRespuesta === 'object' && 'datos' in datosRespuesta
              ? (datosRespuesta as { datos?: NotaConceptual[] }).datos ?? []
              : []);

        let list: NotaConceptual[] = Array.isArray(listaBase) ? listaBase : [];

        // Frontend search & filter fallback since basic API doesn't support them fully
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          list = list.filter(n => n.nombreProyecto.toLowerCase().includes(q) || n.codigo.toLowerCase().includes(q));
        }
        if (statusFilter !== 'todos') {
          list = list.filter(n => n.estado === statusFilter);
        }

        setNotas(list);

        const paginacionRespuesta = datosRespuesta && typeof datosRespuesta === 'object' && 'paginacion' in datosRespuesta
          ? (datosRespuesta as { paginacion?: typeof paginacion }).paginacion
          : dataNotes.paginacion;

        if (paginacionRespuesta) {
          setPaginacion(paginacionRespuesta);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [currentPage, searchQuery, statusFilter]);

  // Load cantons on province change
  const handleProvinceChange = async (provId: string) => {
    setNewNota(prev => ({
      ...prev,
      localizacion: { ...prev.localizacion, provincia: provId, canton: '', parroquia: '' }
    }));
    setCantones([]);
    setParroquias([]);

    if (!provId) return;
    try {
      const res = await fetch(`/api/ubicaciones?provinciaId=${provId}`);
      const data = await res.json();
      if (data.exito) {
        setCantones(data.datos.cantones || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load parishes on canton change
  const handleCantonChange = async (cantonId: string) => {
    setNewNota(prev => ({
      ...prev,
      localizacion: { ...prev.localizacion, canton: cantonId, parroquia: '' }
    }));
    setParroquias([]);

    if (!cantonId || !newNota.localizacion.provincia) return;
    try {
      const res = await fetch(`/api/ubicaciones?provinciaId=${newNota.localizacion.provincia}&cantonId=${cantonId}`);
      const data = await res.json();
      if (data.exito) {
        setParroquias(data.datos.parroquias || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle department change for careers dropdown in wizard
  const handleDeptSelect = (deptId: string) => {
    const selected = departamentos.find(d => d.id === deptId);
    setCarreras(selected ? selected.carreras : []);
    setNewNota(prev => ({
      ...prev,
      departamento: selected ? selected.nombre : '',
      departamentosParticipantes: [deptId]
    }));
  };

  // Handle Convocatoria Form Submit
  const handleCreateConvocatoria = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/convocatorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConv),
      });
      const data = await res.json();
      if (data.exito) {
        showToast('Convocatoria creada exitosamente.');
        fetchData();
        setNewConv({ anio: new Date().getFullYear(), estado: 'activa' });
      } else {
        showToast(data.mensaje || 'Error al crear convocatoria.', 'error');
      }
    } catch {
      showToast('Error de conexión.', 'error');
    }
  };

  // Handle Director Registration Submit
  const handleCreateDirector = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/directores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDirector),
      });
      const data = await res.json();
      if (data.exito) {
        showToast('Director registrado exitosamente.');
        fetchData();
        setNewDirector({ nombre: '', correo: '', telefono: '' });
      } else {
        showToast(data.mensaje || 'Error al registrar director.', 'error');
      }
    } catch {
      showToast('Error de conexión.', 'error');
    }
  };

  // Handle alignments checklists toggle
  const toggleAlineamiento = (field: keyof typeof newNota.alineamiento, val: string) => {
    setNewNota(prev => {
      const currentList = prev.alineamiento[field] as string[];
      const newList = currentList.includes(val)
        ? currentList.filter(item => item !== val)
        : [...currentList, val];
      return {
        ...prev,
        alineamiento: {
          ...prev.alineamiento,
          [field]: newList
        }
      };
    });
  };

  // Submit new Nota Conceptual
  const handleSubmitNota = async () => {
    // Basic validation before submit
    if (!newNota.nombreProyecto.trim()) {
      showToast('Por favor ingrese el nombre del proyecto.', 'error');
      return;
    }
    if (!newNota.convocatoriaId) {
      showToast('Por favor seleccione una convocatoria.', 'error');
      return;
    }
    if (!newNota.directorId) {
      showToast('Por favor seleccione un director.', 'error');
      return;
    }

    // Map ID selectors to Name values for nested objects if required by validations
    const activeProv = provincias.find(p => p.id === newNota.localizacion.provincia)?.nombre || '';
    const activeCant = cantones.find(c => c.id === newNota.localizacion.canton)?.nombre || '';
    const activeParr = parroquias.find(p => p.id === newNota.localizacion.parroquia)?.nombre || '';

    const payload = {
      ...newNota,
      localizacion: {
        ...newNota.localizacion,
        provincia: activeProv,
        canton: activeCant,
        parroquia: activeParr
      }
    };

    try {
      const res = await fetch('/api/notas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.exito) {
        showToast('Nota conceptual guardada con éxito.');
        setIsCreatingNota(false);
        setWizardStep(1);
        fetchNotes();
        fetchData();
      } else {
        // Show validation errors
        if (data.errores && Array.isArray(data.errores)) {
          showToast(data.errores.join(' | '), 'error');
        } else {
          showToast(data.mensaje || 'Error al guardar la nota conceptual.', 'error');
        }
      }
    } catch {
      showToast('Error al conectar con el servidor.', 'error');
    }
  };

  // Fetch specific note detail
  const selectNoteForDetail = async (code: string) => {
    try {
      const res = await fetch(`/api/notas/${code}`);
      const data = await res.json();
      if (data.exito) {
        setSelectedNota(data.datos);
      } else {
        showToast('No se pudo cargar el detalle.', 'error');
      }
    } catch {
      showToast('Error de conexión.', 'error');
    }
  };

  // Update note status
  const handleUpdateStatus = async (code: string, newStatus: EstadoNota) => {
    try {
      const res = await fetch(`/api/notas/${code}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus })
      });
      const data = await res.json();
      if (data.exito) {
        showToast(`Estado cambiado a "${newStatus}" exitosamente.`);
        selectNoteForDetail(code); // refresh detail modal
        fetchNotes();
        fetchData();
      } else {
        showToast(data.mensaje || 'Error al cambiar de estado.', 'error');
      }
    } catch {
      showToast('Error de conexión.', 'error');
    }
  };

  // Add budget item to note
  const handleAddBudgetItem = async (e: React.FormEvent, code: string) => {
    e.preventDefault();
    if (!newBudgetItem.descripcion.trim()) return;

    try {
      const res = await fetch(`/api/notas/${code}/presupuesto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBudgetItem)
      });
      const data = await res.json();
      if (data.exito) {
        showToast('Ítem presupuestario agregado.');
        setNewBudgetItem({ descripcion: '', cantidad: 1, valorUnitario: 0 });
        selectNoteForDetail(code); // refresh detail
        fetchNotes();
        fetchData();
      } else {
        // handle check limit
        if (data.errores) {
          showToast(data.errores.join(' '), 'error');
        } else {
          showToast(data.mensaje || 'Error al guardar el ítem.', 'error');
        }
      }
    } catch {
      showToast('Error al enviar la petición.', 'error');
    }
  };

  // Add activity item to note cronograma
  const handleAddActivityItem = async (e: React.FormEvent, code: string) => {
    e.preventDefault();
    if (!newActivityItem.descripcion.trim() || !newActivityItem.fechaInicio || !newActivityItem.fechaFin) return;

    try {
      const res = await fetch(`/api/notas/${code}/cronograma`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActivityItem)
      });
      const data = await res.json();
      if (data.exito) {
        showToast('Actividad agregada al cronograma.');
        setNewActivityItem({ descripcion: '', fechaInicio: '', fechaFin: '', responsable: '' });
        selectNoteForDetail(code); // refresh detail
      } else {
        if (data.errores) {
          showToast(data.errores.join(' '), 'error');
        } else {
          showToast(data.mensaje || 'Error al guardar la actividad.', 'error');
        }
      }
    } catch {
      showToast('Error de conexión.', 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Toast Alert */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`} id="toast-notification">
          <span>{toast.type === 'error' ? '❌' : '✨'}</span>
          <p>{toast.message}</p>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <span className="brand-title">Convocatorias</span>
        </div>

        <nav>
          <ul className="nav-list">
            <li className="nav-item">
              <button 
                id="nav-dashboard"
                className={`nav-link ${currentTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentTab('dashboard')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                Panel de Control
              </button>
            </li>
            <li className="nav-item">
              <button 
                id="nav-convocatorias"
                className={`nav-link ${currentTab === 'convocatorias' ? 'active' : ''}`}
                onClick={() => setCurrentTab('convocatorias')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Convocatorias
              </button>
            </li>
            <li className="nav-item">
              <button 
                id="nav-directores"
                className={`nav-link ${currentTab === 'directores' ? 'active' : ''}`}
                onClick={() => setCurrentTab('directores')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Directores
              </button>
            </li>
            <li className="nav-item">
              <button 
                id="nav-notas"
                className={`nav-link ${currentTab === 'notas' ? 'active' : ''}`}
                onClick={() => { setCurrentTab('notas'); setIsCreatingNota(false); }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Notas Conceptuales
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <span>Gesti&oacute;n de Convocatorias v1.0</span>
          <span>Despliegue Local Docker</span>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        
        {/* ==========================================
            TAB: PANEL DE CONTROL / DASHBOARD
            ========================================== */}
        {currentTab === 'dashboard' && (
          <section id="panel-dashboard">
            <div className="header-row">
              <div className="page-title-group">
                <h1>Panel de Control</h1>
                <p>Estadísticas clave de los proyectos y notas conceptuales vigentes</p>
              </div>
              <button className="btn btn-primary" onClick={() => { setCurrentTab('notas'); setIsCreatingNota(true); setWizardStep(1); }}>
                <span>➕</span> Nueva Nota Conceptual
              </button>
            </div>

            {/* Stats Dashboard Grid */}
            <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
              <div className="card stat-card">
                <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                </div>
                <div>
                  <div className="stat-val" id="stat-total-notas">{stats.totalNotas}</div>
                  <div className="stat-lbl">Notas Registradas</div>
                </div>
              </div>

              <div className="card stat-card">
                <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--secondary)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <div>
                  <div className="stat-val" id="stat-total-presupuesto">${stats.totalBudget.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="stat-lbl">Presupuesto Acumulado</div>
                </div>
              </div>

              <div className="card stat-card">
                <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--warning)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                </div>
                <div>
                  <div className="stat-val" id="stat-promedio-presupuesto">${stats.averageBudget.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="stat-lbl">Promedio por Nota</div>
                </div>
              </div>

              <div className="card stat-card">
                <div className="stat-icon-wrapper" style={{ backgroundColor: '#a855f7' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <div>
                  <div className="stat-val" id="stat-aprobadas">{stats.byStatus.aprobada || 0}</div>
                  <div className="stat-lbl">Notas Aprobadas</div>
                </div>
              </div>
            </div>

            {/* Dashboard Sub-grid */}
            <div className="dashboard-grid">
              {/* Left Column: Recent Notes list */}
              <div className="card">
                <h3 className="detail-title" style={{ color: 'white', marginBottom: '1.25rem' }}>Notas Conceptuales Recientes</h3>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Proyecto</th>
                        <th>Estado</th>
                        <th>Presupuesto</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notas.slice(0, 3).map(nota => (
                        <tr key={nota.codigo}>
                          <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{nota.codigo}</td>
                          <td>
                            <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
                              {nota.nombreProyecto}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sede: {nota.sedeUnidadAcademica}</span>
                          </td>
                          <td>
                            <span className={`badge badge-${nota.estado === 'en revisión' ? 'revision' : nota.estado}`}>
                              {nota.estado}
                            </span>
                          </td>
                          <td>${(nota.presupuesto?.items ? nota.presupuesto.items.reduce((acc, it) => acc + it.total, 0) : 0).toLocaleString('es-EC', { minimumFractionDigits: 2 })}</td>
                          <td>
                            <button className="btn btn-secondary btn-sm" onClick={() => selectNoteForDetail(nota.codigo)}>
                              Ver Detalle
                            </button>
                          </td>
                        </tr>
                      ))}
                      {notas.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay notas conceptuales cargadas.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Status Breakdown charts */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 className="detail-title" style={{ color: 'white' }}>Estado de Propuestas</h3>
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span>Aprobadas</span>
                    <span style={{ fontWeight: 'bold' }}>{stats.byStatus.aprobada || 0}</span>
                  </div>
                  <div className="bullet-chart">
                    <div className="bullet-bar" style={{ width: `${(stats.byStatus.aprobada / (stats.totalNotas || 1)) * 100}%`, backgroundColor: 'var(--secondary)' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span>En Revisión</span>
                    <span style={{ fontWeight: 'bold' }}>{stats.byStatus['en revisión'] || 0}</span>
                  </div>
                  <div className="bullet-chart">
                    <div className="bullet-bar" style={{ width: `${(stats.byStatus['en revisión'] / (stats.totalNotas || 1)) * 100}%`, backgroundColor: 'var(--warning)' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span>Registradas</span>
                    <span style={{ fontWeight: 'bold' }}>{stats.byStatus.registrada || 0}</span>
                  </div>
                  <div className="bullet-chart">
                    <div className="bullet-bar" style={{ width: `${(stats.byStatus.registrada / (stats.totalNotas || 1)) * 100}%`, backgroundColor: 'var(--primary)' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span>Rechazadas</span>
                    <span style={{ fontWeight: 'bold' }}>{stats.byStatus.rechazada || 0}</span>
                  </div>
                  <div className="bullet-chart">
                    <div className="bullet-bar" style={{ width: `${(stats.byStatus.rechazada / (stats.totalNotas || 1)) * 100}%`, backgroundColor: 'var(--accent)' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==========================================
            TAB: CONVOCATORIAS
            ========================================== */}
        {currentTab === 'convocatorias' && (
          <section id="panel-convocatorias">
            <div className="header-row">
              <div className="page-title-group">
                <h1>Convocatorias</h1>
                <p>Configurar y administrar convocatorias anuales de notas conceptuales</p>
              </div>
            </div>

            <div className="dashboard-grid">
              {/* List Card */}
              <div className="card">
                <h3 className="detail-title" style={{ color: 'white', marginBottom: '1.25rem' }}>Convocatorias Registradas</h3>
                <div className="table-container">
                  <table className="custom-table" id="table-convocatorias">
                    <thead>
                      <tr>
                        <th>ID de Convocatoria</th>
                        <th>Año Académico</th>
                        <th>Estado Actual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {convocatorias.map(conv => (
                        <tr key={conv.id}>
                          <td style={{ fontWeight: '600' }}>{conv.id}</td>
                          <td style={{ fontSize: '1.05rem', fontWeight: '700' }}>{conv.anio}</td>
                          <td>
                            <span className={`badge badge-${conv.estado === 'activa' ? 'active' : 'inactive'}`}>
                              {conv.estado === 'activa' ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Form Card */}
              <div className="card" style={{ height: 'fit-content' }}>
                <h3 className="detail-title" style={{ color: 'white', marginBottom: '1.25rem' }}>Inicializar Convocatoria</h3>
                <form onSubmit={handleCreateConvocatoria} id="form-convocatoria">
                  <div className="form-group">
                    <label className="form-label" htmlFor="anio-conv">Año de la Convocatoria</label>
                    <input 
                      type="number" 
                      id="anio-conv"
                      className="form-input" 
                      value={newConv.anio}
                      onChange={e => setNewConv(prev => ({ ...prev, anio: parseInt(e.target.value) || new Date().getFullYear() }))} 
                      min="2020" 
                      max="2035" 
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="estado-conv">Estado Inicial</label>
                    <select 
                      id="estado-conv" 
                      className="form-select"
                      value={newConv.estado}
                      onChange={e => setNewConv(prev => ({ ...prev, estado: e.target.value as 'activa' | 'inactiva' }))}
                    >
                      <option value="activa">Activa</option>
                      <option value="inactiva">Inactiva</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} id="btn-submit-conv">
                    Crear Convocatoria
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* ==========================================
            TAB: DIRECTORES
            ========================================== */}
        {currentTab === 'directores' && (
          <section id="panel-directores">
            <div className="header-row">
              <div className="page-title-group">
                <h1>Directores de Nota Conceptual</h1>
                <p>Registrar y visualizar los directores institucionales acreditados</p>
              </div>
            </div>

            <div className="dashboard-grid">
              {/* List Card */}
              <div className="card">
                <h3 className="detail-title" style={{ color: 'white', marginBottom: '1.25rem' }}>Directores Acreditados</h3>
                <div className="table-container">
                  <table className="custom-table" id="table-directores">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Correo Institucional</th>
                        <th>Teléfono</th>
                      </tr>
                    </thead>
                    <tbody>
                      {directores.map(dir => (
                        <tr key={dir.id}>
                          <td style={{ fontWeight: '600' }}>{dir.nombre}</td>
                          <td>{dir.correo}</td>
                          <td>{dir.telefono}</td>
                        </tr>
                      ))}
                      {directores.length === 0 && (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Ningún director registrado.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Form Card */}
              <div className="card" style={{ height: 'fit-content' }}>
                <h3 className="detail-title" style={{ color: 'white', marginBottom: '1.25rem' }}>Acreditar Nuevo Director</h3>
                <form onSubmit={handleCreateDirector} id="form-director">
                  <div className="form-group">
                    <label className="form-label" htmlFor="nombre-dir">Nombre Completo</label>
                    <input 
                      type="text" 
                      id="nombre-dir" 
                      className="form-input" 
                      placeholder="Ej. Dr. Isaac Maisincho"
                      value={newDirector.nombre}
                      onChange={e => setNewDirector(prev => ({ ...prev, nombre: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="correo-dir">Correo Institucional</label>
                    <input 
                      type="email" 
                      id="correo-dir" 
                      className="form-input" 
                      placeholder="Ej. isaac.maisincho@espe.edu.ec"
                      value={newDirector.correo}
                      onChange={e => setNewDirector(prev => ({ ...prev, correo: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="telefono-dir">Teléfono de Contacto</label>
                    <input 
                      type="text" 
                      id="telefono-dir" 
                      className="form-input" 
                      placeholder="Ej. 0987654321"
                      value={newDirector.telefono}
                      onChange={e => setNewDirector(prev => ({ ...prev, telefono: e.target.value }))}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} id="btn-submit-director">
                    Registrar Director
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* ==========================================
            TAB: NOTAS CONCEPTUALES (WIZARD & LIST)
            ========================================== */}
        {currentTab === 'notas' && (
          <section id="panel-notas">
            {!isCreatingNota ? (
              // SUB-VIEW: LIST OF NOTAS CONCEPTUALES
              <>
                <div className="header-row">
                  <div className="page-title-group">
                    <h1>Notas Conceptuales</h1>
                    <p>Buscar, filtrar y gestionar las propuestas de notas conceptuales</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => { setIsCreatingNota(true); setWizardStep(1); }} id="btn-nueva-nota">
                    <span>➕</span> Registrar Nota Conceptual
                  </button>
                </div>

                {/* Filter / Search Bar */}
                <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ flexGrow: 1, position: 'relative' }}>
                      <input 
                        type="text" 
                        placeholder="Buscar por código o nombre del proyecto..." 
                        className="form-input"
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        id="search-notas"
                      />
                    </div>
                    <div style={{ width: '200px' }}>
                      <select 
                        className="form-select"
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        id="filter-estado-nota"
                      >
                        <option value="todos">Todos los Estados</option>
                        <option value="registrada">Registrada</option>
                        <option value="en revisión">En Revisión</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="rechazada">Rechazada</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Grid or Table list */}
                <div className="card">
                  <div className="table-container">
                    <table className="custom-table" id="table-notas">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Proyecto</th>
                          <th>Director Responsable</th>
                          <th>Año / Convocatoria</th>
                          <th>Estado</th>
                          <th>Presupuesto</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notas.map(nota => {
                          const dir = directores.find(d => d.id === nota.directorId);
                          const conv = convocatorias.find(c => c.id === nota.convocatoriaId);
                          const budgetSum = nota.presupuesto?.items 
                            ? nota.presupuesto.items.reduce((acc, it) => acc + it.total, 0)
                            : 0;

                          return (
                            <tr key={nota.codigo}>
                              <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{nota.codigo}</td>
                              <td>
                                <div style={{ fontWeight: 600, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={nota.nombreProyecto}>
                                  {nota.nombreProyecto}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  Sede: {nota.sedeUnidadAcademica} | Dept: {nota.departamento}
                                </span>
                              </td>
                              <td>
                                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{dir ? dir.nombre : 'Cargando...'}</div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dir ? dir.correo : ''}</span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 600 }}>{conv ? conv.anio : ''}</div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {nota.convocatoriaId}</span>
                              </td>
                              <td>
                                <span className={`badge badge-${nota.estado === 'en revisión' ? 'revision' : nota.estado}`}>
                                  {nota.estado}
                                </span>
                              </td>
                              <td style={{ fontWeight: '600' }}>
                                ${budgetSum.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                              </td>
                              <td>
                                <button className="btn btn-secondary btn-sm" onClick={() => selectNoteForDetail(nota.codigo)}>
                                  Ver Ficha
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {notas.length === 0 && (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                              No se encontraron notas conceptuales que coincidan con la búsqueda.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Mostrando página <strong>{paginacion.paginaActual}</strong> de <strong>{paginacion.totalPaginas}</strong> ({paginacion.totalRegistros} registros totales)
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      >
                        Anterior
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        disabled={currentPage >= paginacion.totalPaginas}
                        onClick={() => setCurrentPage(prev => Math.min(paginacion.totalPaginas, prev + 1))}
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // SUB-VIEW: STEP WIZARD FORM FOR CREATING NOTA
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', fontWeight: 700 }}>Nueva Nota Conceptual</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Complete los datos del formulario institucional paso a paso</p>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setIsCreatingNota(false)}>
                    Cancelar
                  </button>
                </div>

                {/* Wizard Indicators */}
                <div className="wizard-steps">
                  <div className={`wizard-step ${wizardStep === 1 ? 'active' : wizardStep > 1 ? 'completed' : ''}`} onClick={() => setWizardStep(1)}>
                    <div className="step-num">1</div>
                    <div className="step-title">Datos Generales</div>
                  </div>
                  <div className={`wizard-step ${wizardStep === 2 ? 'active' : wizardStep > 2 ? 'completed' : ''}`} onClick={() => setWizardStep(2)}>
                    <div className="step-num">2</div>
                    <div className="step-title">Localizaci&oacute;n</div>
                  </div>
                  <div className={`wizard-step ${wizardStep === 3 ? 'active' : wizardStep > 3 ? 'completed' : ''}`} onClick={() => setWizardStep(3)}>
                    <div className="step-num">3</div>
                    <div className="step-title">Alineamiento</div>
                  </div>
                  <div className={`wizard-step ${wizardStep === 4 ? 'active' : wizardStep > 4 ? 'completed' : ''}`} onClick={() => setWizardStep(4)}>
                    <div className="step-num">4</div>
                    <div className="step-title">Impactos</div>
                  </div>
                  <div className={`wizard-step ${wizardStep === 5 ? 'active' : ''}`} onClick={() => setWizardStep(5)}>
                    <div className="step-num">5</div>
                    <div className="step-title">Firmas</div>
                  </div>
                </div>

                {/* STEP 1: Datos Generales */}
                {wizardStep === 1 && (
                  <div id="step-1-content">
                    <h3 className="detail-title">Informaci&oacute;n General del Proyecto</h3>
                    <div className="form-group">
                      <label className="form-label" htmlFor="new-nombre">Nombre del Proyecto</label>
                      <input 
                        type="text" 
                        id="new-nombre"
                        className="form-input" 
                        placeholder="Ingrese el título completo del proyecto..."
                        value={newNota.nombreProyecto}
                        onChange={e => setNewNota(prev => ({ ...prev, nombreProyecto: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="grid-cols-2">
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-convocatoria">Convocatoria Año</label>
                        <select 
                          id="new-convocatoria" 
                          className="form-select"
                          value={newNota.convocatoriaId}
                          onChange={e => setNewNota(prev => ({ ...prev, convocatoriaId: e.target.value }))}
                          required
                        >
                          <option value="">Seleccione convocatoria...</option>
                          {convocatorias.filter(c => c.estado === 'activa').map(c => (
                            <option key={c.id} value={c.id}>Convocatoria {c.anio} (Activa)</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="new-director">Director Responsable</label>
                        <select 
                          id="new-director" 
                          className="form-select"
                          value={newNota.directorId}
                          onChange={e => setNewNota(prev => ({ ...prev, directorId: e.target.value }))}
                          required
                        >
                          <option value="">Seleccione director...</option>
                          {directores.map(d => (
                            <option key={d.id} value={d.id}>{d.nombre} ({d.correo})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid-cols-3">
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-sede">Sede / Unidad Acad&eacute;mica</label>
                        <input 
                          type="text" 
                          id="new-sede" 
                          className="form-input"
                          value={newNota.sedeUnidadAcademica}
                          onChange={e => setNewNota(prev => ({ ...prev, sedeUnidadAcademica: e.target.value }))}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="new-dept">Departamento Principal</label>
                        <select 
                          id="new-dept" 
                          className="form-select"
                          value={departamentos.find(d => d.nombre === newNota.departamento)?.id || ''}
                          onChange={e => handleDeptSelect(e.target.value)}
                        >
                          <option value="">Seleccione departamento...</option>
                          {departamentos.map(d => (
                            <option key={d.id} value={d.id}>{d.nombre}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="new-carreras">Carreras Participantes</label>
                        <select 
                          id="new-carreras" 
                          className="form-select"
                          multiple
                          style={{ height: '80px' }}
                          value={newNota.carrerasParticipantes}
                          onChange={e => {
                            const opts = Array.from(e.target.selectedOptions).map(o => o.value);
                            setNewNota(prev => ({ ...prev, carrerasParticipantes: opts }));
                          }}
                        >
                          {carreras.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                          ))}
                        </select>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ctrl+Click para seleccionar múltiples</span>
                      </div>
                    </div>

                    <div className="grid-cols-2">
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-inicio">Fecha Estimada de Inicio</label>
                        <input 
                          type="date" 
                          id="new-inicio" 
                          className="form-input"
                          value={newNota.plazoEjecucion.fechaInicio.slice(0, 10)}
                          onChange={e => setNewNota(prev => ({ 
                            ...prev, 
                            plazoEjecucion: { ...prev.plazoEjecucion, fechaInicio: new Date(e.target.value).toISOString() } 
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="new-fin">Fecha Estimada de Fin</label>
                        <input 
                          type="date" 
                          id="new-fin" 
                          className="form-input"
                          value={newNota.plazoEjecucion.fechaFin.slice(0, 10)}
                          onChange={e => setNewNota(prev => ({ 
                            ...prev, 
                            plazoEjecucion: { ...prev.plazoEjecucion, fechaFin: new Date(e.target.value).toISOString() } 
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Localización */}
                {wizardStep === 2 && (
                  <div id="step-2-content">
                    <h3 className="detail-title">Localizaci&oacute;n y Cobertura Geogr&aacute;fica</h3>
                    
                    <div className="grid-cols-2">
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-cobertura">Nivel de Cobertura</label>
                        <select 
                          id="new-cobertura" 
                          className="form-select"
                          value={newNota.localizacion.cobertura}
                          onChange={e => setNewNota(prev => ({ 
                            ...prev, 
                            localizacion: { ...prev.localizacion, cobertura: e.target.value as NivelCobertura } 
                          }))}
                        >
                          <option value="Nacional">Nacional</option>
                          <option value="Provincial">Provincial</option>
                          <option value="Cantonal">Cantonal</option>
                          <option value="Parroquial">Parroquial</option>
                          <option value="Barrio">Barrio</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="new-provincia">Provincia</label>
                        <select 
                          id="new-provincia" 
                          className="form-select"
                          value={newNota.localizacion.provincia}
                          onChange={e => handleProvinceChange(e.target.value)}
                        >
                          <option value="">Seleccione provincia...</option>
                          {provincias.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid-cols-2">
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-canton">Cant&oacute;n</label>
                        <select 
                          id="new-canton" 
                          className="form-select"
                          disabled={cantones.length === 0}
                          value={newNota.localizacion.canton}
                          onChange={e => handleCantonChange(e.target.value)}
                        >
                          <option value="">Seleccione cant&oacute;n...</option>
                          {cantones.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="new-parroquia">Parroquia</label>
                        <select 
                          id="new-parroquia" 
                          className="form-select"
                          disabled={parroquias.length === 0}
                          value={newNota.localizacion.parroquia}
                          onChange={e => setNewNota(prev => ({ 
                            ...prev, 
                            localizacion: { ...prev.localizacion, parroquia: e.target.value } 
                          }))}
                        >
                          <option value="">Seleccione parroquia...</option>
                          {parroquias.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="new-det-ubicacion">Detalle de la Ubicaci&oacute;n Espec&iacute;fica</label>
                      <input 
                        type="text" 
                        id="new-det-ubicacion"
                        className="form-input"
                        placeholder="Ej. Comunidades rurales del sector noroccidente de Pichincha"
                        value={newNota.localizacion.detalleUbicacion}
                        onChange={e => setNewNota(prev => ({ 
                          ...prev, 
                          localizacion: { ...prev.localizacion, detalleUbicacion: e.target.value } 
                        }))}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: Alineamiento */}
                {wizardStep === 3 && (
                  <div id="step-3-content">
                    <h3 className="detail-title">Alineamiento Estrat&eacute;gico e Institucional</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* Sectores de Población */}
                      <div className="card" style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>Sectores de Poblaci&oacute;n Beneficiaria</h4>
                        <div style={{ display: 'flex', gap: '2rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={newNota.sectorPoblacion.urbanoMarginal}
                              onChange={e => setNewNota(prev => ({ 
                                ...prev, 
                                sectorPoblacion: { ...prev.sectorPoblacion, urbanoMarginal: e.target.checked } 
                              }))}
                            />
                            Urbano Marginal
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={newNota.sectorPoblacion.rural}
                              onChange={e => setNewNota(prev => ({ 
                                ...prev, 
                                sectorPoblacion: { ...prev.sectorPoblacion, rural: e.target.checked } 
                              }))}
                            />
                            Rural
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={newNota.sectorPoblacion.grupoAtencionPrioritaria}
                              onChange={e => setNewNota(prev => ({ 
                                ...prev, 
                                sectorPoblacion: { ...prev.sectorPoblacion, grupoAtencionPrioritaria: e.target.checked } 
                              }))}
                            />
                            Grupo de Atenci&oacute;n Prioritaria
                          </label>
                        </div>
                      </div>

                      {/* ODS 2030 objectives */}
                      <div className="card" style={{ padding: '1.25rem' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>Alineamiento Objetivos ODS 2030</h4>
                        <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {catalogos?.objetivosODS2030.map(ods => (
                            <label key={ods} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                              <input 
                                type="checkbox"
                                checked={newNota.alineamiento.objetivosODS2030.includes(ods)}
                                onChange={() => toggleAlineamiento('objetivosODS2030', ods)}
                              />
                              {ods}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Ambitos Prioritarios */}
                      <div className="grid-cols-2">
                        <div className="card" style={{ padding: '1rem' }}>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>&Aacute;mbitos Prioritarios</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '120px', overflowY: 'auto' }}>
                            {catalogos?.ambitosPrioritarios.map(amb => (
                              <label key={amb} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                                <input 
                                  type="checkbox" 
                                  checked={newNota.alineamiento.ambitosPrioritarios.includes(amb)}
                                  onChange={() => toggleAlineamiento('ambitosPrioritarios', amb)}
                                />
                                {amb}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="card" style={{ padding: '1rem' }}>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>Cine Unesco</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '120px', overflowY: 'auto' }}>
                            {catalogos?.camposCineUnesco.map(cine => (
                              <label key={cine} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                                <input 
                                  type="checkbox" 
                                  checked={newNota.alineamiento.camposCineUnesco.includes(cine)}
                                  onChange={() => toggleAlineamiento('camposCineUnesco', cine)}
                                />
                                {cine}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Text inputs for research areas */}
                      <div className="grid-cols-2">
                        <div className="form-group">
                          <label className="form-label">Dominio Acad&eacute;mico Principal</label>
                          <select 
                            className="form-select"
                            value={newNota.alineamiento.dominioAcademico[0] || ''}
                            onChange={e => setNewNota(prev => ({ 
                              ...prev, 
                              alineamiento: { ...prev.alineamiento, dominioAcademico: [e.target.value] } 
                            }))}
                          >
                            <option value="">Seleccione dominio...</option>
                            {catalogos?.dominioAcademico.map(dom => (
                              <option key={dom} value={dom}>{dom}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">L&iacute;nea de Investigaci&oacute;n Institucional</label>
                          <select 
                            className="form-select"
                            value={newNota.alineamiento.lineasInvestigacion[0] || ''}
                            onChange={e => setNewNota(prev => ({ 
                              ...prev, 
                              alineamiento: { ...prev.alineamiento, lineasInvestigacion: [e.target.value] } 
                            }))}
                          >
                            <option value="">Seleccione l&iacute;nea...</option>
                            {catalogos?.lineasInvestigacion.map(lin => (
                              <option key={lin} value={lin}>{lin}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Impactos y Caracterización */}
                {wizardStep === 4 && (
                  <div id="step-4-content">
                    <h3 className="detail-title">Impactos Esperados y Poblaci&oacute;n</h3>
                    
                    {/* Populations inputs */}
                    <div className="grid-cols-3" style={{ marginBottom: '1.5rem' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-pop-ref">Poblaci&oacute;n de Referencia</label>
                        <input 
                          type="number" 
                          id="new-pop-ref" 
                          className="form-input"
                          value={newNota.caracterizacionPoblacion.poblacionReferencia}
                          onChange={e => setNewNota(prev => ({ 
                            ...prev, 
                            caracterizacionPoblacion: { ...prev.caracterizacionPoblacion, poblacionReferencia: parseInt(e.target.value) || 0 } 
                          }))}
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-pop-pot">Poblaci&oacute;n Potencial</label>
                        <input 
                          type="number" 
                          id="new-pop-pot" 
                          className="form-input"
                          value={newNota.caracterizacionPoblacion.poblacionPotencial}
                          onChange={e => setNewNota(prev => ({ 
                            ...prev, 
                            caracterizacionPoblacion: { ...prev.caracterizacionPoblacion, poblacionPotencial: parseInt(e.target.value) || 0 } 
                          }))}
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-pop-obj">Poblaci&oacute;n Objetivo</label>
                        <input 
                          type="number" 
                          id="new-pop-obj" 
                          className="form-input"
                          value={newNota.caracterizacionPoblacion.poblacionObjetivo}
                          onChange={e => setNewNota(prev => ({ 
                            ...prev, 
                            caracterizacionPoblacion: { ...prev.caracterizacionPoblacion, poblacionObjetivo: parseInt(e.target.value) || 0 } 
                          }))}
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Impact Textareas */}
                    <div className="grid-cols-2">
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-imp-soc">Impacto Social</label>
                        <textarea 
                          id="new-imp-soc" 
                          className="form-textarea" 
                          placeholder="Describa el impacto social esperado..."
                          value={newNota.impactosEsperados.social}
                          onChange={e => setNewNota(prev => ({ 
                            ...prev, 
                            impactosEsperados: { ...prev.impactosEsperados, social: e.target.value } 
                          }))}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-imp-eco">Impacto Econ&oacute;mico</label>
                        <textarea 
                          id="new-imp-eco" 
                          className="form-textarea" 
                          placeholder="Describa el impacto econ&oacute;mico..."
                          value={newNota.impactosEsperados.economico}
                          onChange={e => setNewNota(prev => ({ 
                            ...prev, 
                            impactosEsperados: { ...prev.impactosEsperados, economico: e.target.value } 
                          }))}
                        />
                      </div>
                    </div>

                    <div className="grid-cols-2">
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-imp-amb">Impacto Ambiental</label>
                        <textarea 
                          id="new-imp-amb" 
                          className="form-textarea" 
                          placeholder="Describa el impacto ambiental..."
                          value={newNota.impactosEsperados.ambiental}
                          onChange={e => setNewNota(prev => ({ 
                            ...prev, 
                            impactosEsperados: { ...prev.impactosEsperados, ambiental: e.target.value } 
                          }))}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-imp-cie">Impacto Cient&iacute;fico</label>
                        <textarea 
                          id="new-imp-cie" 
                          className="form-textarea" 
                          placeholder="Describa la relevancia o impacto cient&iacute;fico..."
                          value={newNota.impactosEsperados.cientifico}
                          onChange={e => setNewNota(prev => ({ 
                            ...prev, 
                            impactosEsperados: { ...prev.impactosEsperados, cientifico: e.target.value } 
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Firmas */}
                {wizardStep === 5 && (
                  <div id="step-5-content">
                    <h3 className="detail-title">Firmas de Responsabilidad</h3>
                    
                    <div className="grid-cols-2">
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-f-dir">Director del Proyecto</label>
                        <input 
                          type="text" 
                          id="new-f-dir"
                          className="form-input"
                          placeholder="Nombre del director..."
                          value={newNota.firmasResponsabilidad.directorNota}
                          onChange={e => setNewNota(prev => ({ 
                            ...prev, 
                            firmasResponsabilidad: { ...prev.firmasResponsabilidad, directorNota: e.target.value } 
                          }))}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-f-carr">Director de Carrera</label>
                        <input 
                          type="text" 
                          id="new-f-carr" 
                          className="form-input"
                          placeholder="Nombre director carrera..."
                          value={newNota.firmasResponsabilidad.directorCarrera}
                          onChange={e => setNewNota(prev => ({ 
                            ...prev, 
                            firmasResponsabilidad: { ...prev.firmasResponsabilidad, directorCarrera: e.target.value } 
                          }))}
                        />
                      </div>
                    </div>

                    <div className="grid-cols-2">
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-f-vinc">Coordinador de Vinculaci&oacute;n</label>
                        <input 
                          type="text" 
                          id="new-f-vinc" 
                          className="form-input"
                          placeholder="Nombre coordinador..."
                          value={newNota.firmasResponsabilidad.coordinadorVinculacion}
                          onChange={e => setNewNota(prev => ({ 
                            ...prev, 
                            firmasResponsabilidad: { ...prev.firmasResponsabilidad, coordinadorVinculacion: e.target.value } 
                          }))}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-f-dept">Director de Departamento</label>
                        <input 
                          type="text" 
                          id="new-f-dept" 
                          className="form-input"
                          placeholder="Nombre director departamento..."
                          value={newNota.firmasResponsabilidad.directorDepartamento}
                          onChange={e => setNewNota(prev => ({ 
                            ...prev, 
                            firmasResponsabilidad: { ...prev.firmasResponsabilidad, directorDepartamento: e.target.value } 
                          }))}
                        />
                      </div>
                    </div>

                    <div className="card" style={{ marginTop: '2rem', padding: '1.5rem', borderColor: 'var(--secondary)' }}>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <strong>Aviso importante:</strong> Para que la nota conceptual sea v&aacute;lida, debe inicializarse con al menos una actividad registrada en su cronograma. El sistema agregar&aacute; una actividad general autom&aacute;tica de inicio que luego podr&aacute; editar.
                      </p>
                    </div>
                  </div>
                )}

                {/* Wizard Navigation Buttons */}
                <div className="wizard-buttons">
                  <button 
                    className="btn btn-secondary" 
                    disabled={wizardStep === 1}
                    onClick={() => setWizardStep(prev => Math.max(1, prev - 1))}
                  >
                    Anterior
                  </button>

                  {wizardStep < 5 ? (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setWizardStep(prev => Math.min(5, prev + 1))}
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button 
                      className="btn btn-success" 
                      onClick={handleSubmitNota}
                      id="btn-guardar-nota"
                    >
                      Guardar Propuesta
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

      </main>

      {/* ==========================================
          MODAL DIALOG: NOTA CONCEPTUAL DETAIL SHEET
          ========================================== */}
      {selectedNota && (
        <div className="modal-overlay" onClick={() => setSelectedNota(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} id="nota-detail-modal">
            
            <button className="close-btn" onClick={() => setSelectedNota(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Ficha de Nota Conceptual</span>
                <span className={`badge badge-${selectedNota.estado === 'en revisión' ? 'revision' : selectedNota.estado}`} id="detail-estado-badge">
                  {selectedNota.estado}
                </span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem', color: 'white' }}>{selectedNota.nombreProyecto}</h2>
              <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--primary)' }}>C&oacute;digo: {selectedNota.codigo}</span>
            </div>

            {/* Workflow state selector */}
            <div className="card" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="form-label" style={{ margin: 0 }}>Actualizar Estado en Workflow:</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={`btn btn-sm ${selectedNota.estado === 'registrada' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleUpdateStatus(selectedNota.codigo, 'registrada')}
                >
                  Registrar
                </button>
                <button 
                  className={`btn btn-sm ${selectedNota.estado === 'en revisión' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleUpdateStatus(selectedNota.codigo, 'en revisión')}
                  id="btn-workflow-revision"
                >
                  En Revisión
                </button>
                <button 
                  className={`btn btn-sm ${selectedNota.estado === 'aprobada' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleUpdateStatus(selectedNota.codigo, 'aprobada')}
                  id="btn-workflow-aprobar"
                >
                  Aprobar
                </button>
                <button 
                  className={`btn btn-sm ${selectedNota.estado === 'rechazada' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleUpdateStatus(selectedNota.codigo, 'rechazada')}
                >
                  Rechazar
                </button>
              </div>
            </div>

            {/* Section 1: General Details */}
            <div className="detail-section">
              <div className="detail-title">
                <span>📋</span> Datos Generales
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-lbl">Sede / Unidad Acad&eacute;mica</span>
                  <span className="detail-val">{selectedNota.sedeUnidadAcademica}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-lbl">Departamento</span>
                  <span className="detail-val">{selectedNota.departamento}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-lbl">Director del Proyecto</span>
                  <span className="detail-val">{directores.find(d => d.id === selectedNota.directorId)?.nombre || selectedNota.directorId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-lbl">Plazo de Ejecuci&oacute;n</span>
                  <span className="detail-val">
                    {new Date(selectedNota.plazoEjecucion.fechaInicio).toLocaleDateString('es-EC')} - {new Date(selectedNota.plazoEjecucion.fechaFin).toLocaleDateString('es-EC')}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Localización y alineamiento */}
            <div className="detail-section">
              <div className="detail-title">
                <span>📍</span> Cobertura y Alineamiento
              </div>
              <div className="detail-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="detail-item">
                  <span className="detail-lbl">Nivel de Cobertura</span>
                  <span className="detail-val">{selectedNota.localizacion.cobertura}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-lbl">Ubicaci&oacute;n</span>
                  <span className="detail-val">
                    {selectedNota.localizacion.provincia} {selectedNota.localizacion.canton ? `/ ${selectedNota.localizacion.canton}` : ''} {selectedNota.localizacion.parroquia ? `/ ${selectedNota.localizacion.parroquia}` : ''}
                  </span>
                </div>
                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-lbl">Detalle de Cobertura</span>
                  <span className="detail-val">{selectedNota.localizacion.detalleUbicacion}</span>
                </div>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-lbl">ODS 2030</span>
                  <span className="detail-val" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {selectedNota.alineamiento.objetivosODS2030.map(o => (
                      <span key={o} style={{ fontSize: '0.85rem' }}>• {o}</span>
                    ))}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-lbl">&Aacute;mbitos Prioritarios</span>
                  <span className="detail-val" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {selectedNota.alineamiento.ambitosPrioritarios.map(a => (
                      <span key={a} style={{ fontSize: '0.85rem' }}>• {a}</span>
                    ))}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Población e Impactos */}
            <div className="detail-section">
              <div className="detail-title">
                <span>👥</span> Impacto Social y Poblaci&oacute;n Beneficiaria
              </div>
              <div className="grid-cols-3" style={{ marginBottom: '1.25rem' }}>
                <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <div className="detail-lbl">Referencia</div>
                  <div className="detail-val-highlight">{selectedNota.caracterizacionPoblacion.poblacionReferencia}</div>
                </div>
                <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <div className="detail-lbl">Potencial</div>
                  <div className="detail-val-highlight">{selectedNota.caracterizacionPoblacion.poblacionPotencial}</div>
                </div>
                <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <div className="detail-lbl">Objetivo</div>
                  <div className="detail-val-highlight">{selectedNota.caracterizacionPoblacion.poblacionObjetivo}</div>
                </div>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-lbl">Impacto Social</span>
                  <span className="detail-val" style={{ fontSize: '0.85rem' }}>{selectedNota.impactosEsperados.social || 'Sin describir'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-lbl">Impacto Econ&oacute;mico</span>
                  <span className="detail-val" style={{ fontSize: '0.85rem' }}>{selectedNota.impactosEsperados.economico || 'Sin describir'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-lbl">Impacto Ambiental</span>
                  <span className="detail-val" style={{ fontSize: '0.85rem' }}>{selectedNota.impactosEsperados.ambiental || 'Sin describir'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-lbl">Impacto Cient&iacute;fico</span>
                  <span className="detail-val" style={{ fontSize: '0.85rem' }}>{selectedNota.impactosEsperados.cientifico || 'Sin describir'}</span>
                </div>
              </div>
            </div>

            {/* Section 4: Budget Planner */}
            <div className="detail-section">
              <div className="detail-title">
                <span>💰</span> Planificaci&oacute;n Presupuestaria
              </div>

              {/* Progress Limit indicator */}
              {(() => {
                const total = selectedNota.presupuesto?.items
                  ? selectedNota.presupuesto.items.reduce((acc, it) => acc + it.total, 0)
                  : 0;
                const percent = Math.min((total / 20000) * 100, 100);
                
                return (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <span>Presupuesto Utilizado: <strong>${total.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</strong></span>
                      <span>L&iacute;mite: <strong>$20,000.00</strong></span>
                    </div>
                    <div className="bullet-chart" style={{ height: '10px' }}>
                      <div className="bullet-bar" style={{ width: `${percent}%`, backgroundColor: percent > 90 ? 'var(--accent)' : 'var(--secondary)' }}></div>
                    </div>
                  </div>
                );
              })()}

              <div className="table-container" style={{ marginBottom: '1.25rem' }}>
                <table className="custom-table" id="table-presupuesto-nota">
                  <thead>
                    <tr>
                      <th>Descripci&oacute;n</th>
                      <th>Cantidad</th>
                      <th>Valor Unitario</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedNota.presupuesto?.items?.map(item => (
                      <tr key={item.id}>
                        <td>{item.descripcion}</td>
                        <td>{item.cantidad}</td>
                        <td>${item.valorUnitario.toFixed(2)}</td>
                        <td style={{ fontWeight: 'bold' }}>${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                    {(!selectedNota.presupuesto?.items || selectedNota.presupuesto.items.length === 0) && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Ning&uacute;n &iacute;tem presupuestario registrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add budget item form */}
              <div className="card" style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'white' }}>Agregar &Iacute;tem Presupuestario</h4>
                <form onSubmit={e => handleAddBudgetItem(e, selectedNota.codigo)} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }} id="form-presupuesto">
                  <div style={{ flexGrow: 1, minWidth: '200px' }}>
                    <input 
                      type="text" 
                      placeholder="Descripci&oacute;n del gasto..." 
                      className="form-input"
                      value={newBudgetItem.descripcion}
                      onChange={e => setNewBudgetItem(prev => ({ ...prev, descripcion: e.target.value }))}
                      required
                      id="input-presupuesto-descripcion"
                    />
                  </div>
                  <div style={{ width: '100px' }}>
                    <input 
                      type="number" 
                      placeholder="Cant" 
                      className="form-input"
                      value={newBudgetItem.cantidad}
                      onChange={e => setNewBudgetItem(prev => ({ ...prev, cantidad: parseInt(e.target.value) || 1 }))}
                      min="1"
                      required
                      id="input-presupuesto-cantidad"
                    />
                  </div>
                  <div style={{ width: '130px' }}>
                    <input 
                      type="number" 
                      placeholder="Unitario ($)" 
                      className="form-input"
                      value={newBudgetItem.valorUnitario || ''}
                      onChange={e => setNewBudgetItem(prev => ({ ...prev, valorUnitario: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.01"
                      required
                      id="input-presupuesto-valor"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" id="btn-submit-presupuesto">
                    Agregar Gasto
                  </button>
                </form>
              </div>
            </div>

            {/* Section 5: Cronograma */}
            <div className="detail-section">
              <div className="detail-title">
                <span>📅</span> Cronograma de Actividades
              </div>

              <div className="table-container" style={{ marginBottom: '1.25rem' }}>
                <table className="custom-table" id="table-cronograma-nota">
                  <thead>
                    <tr>
                      <th>Actividad / Hito</th>
                      <th>Fecha Inicio</th>
                      <th>Fecha Fin</th>
                      <th>Responsable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedNota.cronograma?.map(act => (
                      <tr key={act.id}>
                        <td style={{ fontWeight: 600 }}>{act.descripcion}</td>
                        <td>{new Date(act.fechaInicio).toLocaleDateString('es-EC')}</td>
                        <td>{new Date(act.fechaFin).toLocaleDateString('es-EC')}</td>
                        <td>{act.responsable}</td>
                      </tr>
                    ))}
                    {(!selectedNota.cronograma || selectedNota.cronograma.length === 0) && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Ninguna actividad programada.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add activity form */}
              <div className="card" style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'white' }}>Agregar Actividad al Cronograma</h4>
                <form onSubmit={e => handleAddActivityItem(e, selectedNota.codigo)} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }} id="form-cronograma">
                  <div style={{ flexGrow: 1, minWidth: '200px' }}>
                    <input 
                      type="text" 
                      placeholder="Descripci&oacute;n de la actividad..." 
                      className="form-input"
                      value={newActivityItem.descripcion}
                      onChange={e => setNewActivityItem(prev => ({ ...prev, descripcion: e.target.value }))}
                      required
                      id="input-cronograma-descripcion"
                    />
                  </div>
                  <div style={{ width: '150px' }}>
                    <input 
                      type="date" 
                      className="form-input"
                      value={newActivityItem.fechaInicio}
                      onChange={e => setNewActivityItem(prev => ({ ...prev, fechaInicio: e.target.value }))}
                      required
                      id="input-cronograma-inicio"
                    />
                  </div>
                  <div style={{ width: '150px' }}>
                    <input 
                      type="date" 
                      className="form-input"
                      value={newActivityItem.fechaFin}
                      onChange={e => setNewActivityItem(prev => ({ ...prev, fechaFin: e.target.value }))}
                      required
                      id="input-cronograma-fin"
                    />
                  </div>
                  <div style={{ width: '180px' }}>
                    <input 
                      type="text" 
                      placeholder="Responsable..." 
                      className="form-input"
                      value={newActivityItem.responsable}
                      onChange={e => setNewActivityItem(prev => ({ ...prev, responsable: e.target.value }))}
                      required
                      id="input-cronograma-responsable"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" id="btn-submit-cronograma">
                    Agregar Actividad
                  </button>
                </form>
              </div>
            </div>

            {/* Section 6: Firmas */}
            <div className="detail-section">
              <div className="detail-title">
                <span>✍️</span> Firmas Autorizadas
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-lbl">Director Proyecto</span>
                  <span className="detail-val" style={{ fontStyle: 'italic' }}>{selectedNota.firmasResponsabilidad.directorNota || 'Pendiente'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-lbl">Director Carrera</span>
                  <span className="detail-val" style={{ fontStyle: 'italic' }}>{selectedNota.firmasResponsabilidad.directorCarrera || 'Pendiente'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-lbl">Coordinador Vinculaci&oacute;n</span>
                  <span className="detail-val" style={{ fontStyle: 'italic' }}>{selectedNota.firmasResponsabilidad.coordinadorVinculacion || 'Pendiente'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-lbl">Director Departamento</span>
                  <span className="detail-val" style={{ fontStyle: 'italic' }}>{selectedNota.firmasResponsabilidad.directorDepartamento || 'Pendiente'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
