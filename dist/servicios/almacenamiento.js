"use strict";
// ============================================================
// Almacenamiento en memoria — Capa de servicios
// ============================================================
// Simula la persistencia de datos durante la ejecución del
// servidor. Se usa un módulo singleton gracias al cache de
// módulos de Node.js.
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerConvocatorias = obtenerConvocatorias;
exports.agregarConvocatoria = agregarConvocatoria;
exports.buscarConvocatoriaPorId = buscarConvocatoriaPorId;
exports.obtenerDirectores = obtenerDirectores;
exports.agregarDirector = agregarDirector;
exports.buscarDirectorPorId = buscarDirectorPorId;
exports.obtenerNotas = obtenerNotas;
exports.agregarNota = agregarNota;
exports.buscarNotaPorCodigo = buscarNotaPorCodigo;
exports.actualizarNota = actualizarNota;
// ── Almacenes ────────────────────────────────────────────────
// ── Almacenes ────────────────────────────────────────────────
const convocatorias = [
    { id: 'conv-2026', anio: 2026, estado: 'activa' },
    { id: 'conv-2025', anio: 2025, estado: 'inactiva' }
];
const directores = [
    { id: 'dir-1', nombre: 'Dr. Isaac Maisincho', correo: 'isaac.maisincho@espe.edu.ec', telefono: '0987654321' },
    { id: 'dir-2', nombre: 'Dra. María Torres', correo: 'maria.torres@espe.edu.ec', telefono: '0998877665' },
    { id: 'dir-3', nombre: 'Ing. José Pérez', correo: 'jose.perez@espe.edu.ec', telefono: '0912345678' }
];
const notas = [
    {
        codigo: 'NC-2026-A1B2',
        convocatoriaId: 'conv-2026',
        nombreProyecto: 'Sistema Inteligente de Monitoreo de Sostenibilidad Agrícola en Zonas Rurales',
        sedeUnidadAcademica: 'Matriz Sangolquí',
        departamento: 'Ciencias de la Computación',
        plazoEjecucion: {
            fechaInicio: '2026-03-01T00:00:00.000Z',
            fechaFin: '2027-03-01T00:00:00.000Z'
        },
        directorId: 'dir-1',
        localizacion: {
            cobertura: 'Provincial',
            provincia: 'Pichincha',
            canton: 'Quito',
            parroquia: 'Pacto',
            detalleUbicacion: 'Comunidades agrícolas del noroccidente de Quito'
        },
        sectorPoblacion: {
            urbanoMarginal: false,
            rural: true,
            grupoAtencionPrioritaria: true
        },
        alineamiento: {
            ambitosPrioritarios: ['Desarrollo sostenible', 'Innovación tecnológica'],
            objetivosODS2030: ['Hambre cero (ODS 2)', 'Producción y consumo responsables (ODS 12)'],
            camposCineUnesco: ['Tecnologías de la información y la comunicación (TIC)'],
            objetivosPND: ['Eje Económico: Fomento de la productividad y sostenibilidad'],
            objetivosGAD: ['Objetivo 1: Fomento productivo y conservación ambiental'],
            objetivosPlanEstrategico: ['Línea de investigación institucional 2: Tecnologías emergentes'],
            lineasInvestigacion: ['Sistemas de Información y Software', 'Tecnologías Agrícolas'],
            dominioAcademico: ['Tecnología de Información y Comunicaciones']
        },
        departamentosParticipantes: ['dep-ciencias-computacion', 'dep-ciencias-vida'],
        carrerasParticipantes: ['car-software', 'car-agropecuaria'],
        impactosEsperados: {
            economico: 'Reducción del 15% en costos de fertilizantes para pequeños agricultores.',
            social: 'Capacitación a 120 familias de la zona en el uso de la herramienta tecnológica.',
            politico: 'Generación de reportes útiles para los planes de desarrollo del GAD Parroquial.',
            cientifico: 'Publicación de un artículo indexado en Scopus sobre agricultura inteligente.',
            ambiental: 'Optimización del uso de agua mediante sensores de humedad inteligentes.',
            otros: 'Vinculación de estudiantes de últimos semestres en proyectos reales.'
        },
        caracterizacionPoblacion: {
            poblacionReferencia: 5000,
            poblacionPotencial: 2000,
            poblacionObjetivo: 450
        },
        presupuesto: {
            items: [
                { id: 'item-1', descripcion: 'Sensores de humedad de suelo e Internet de las Cosas (IoT)', cantidad: 10, valorUnitario: 85.00, total: 850.00 },
                { id: 'item-2', descripcion: 'Servicios cloud de hosting y base de datos (12 meses)', cantidad: 1, valorUnitario: 350.00, total: 350.00 },
                { id: 'item-3', descripcion: 'Materiales didácticos para talleres de capacitación', cantidad: 3, valorUnitario: 120.00, total: 360.00 }
            ],
            aporteEntidadAuspiciante: 500.00
        },
        cronograma: [
            { id: 'act-1', descripcion: 'Adquisición y calibración de sensores IoT', fechaInicio: '2026-03-01T00:00:00.000Z', fechaFin: '2026-04-30T00:00:00.000Z', responsable: 'Dr. Isaac Maisincho' },
            { id: 'act-2', descripcion: 'Desarrollo de la plataforma web de monitoreo', fechaInicio: '2026-05-01T00:00:00.000Z', fechaFin: '2026-09-30T00:00:00.000Z', responsable: 'Ing. José Pérez' },
            { id: 'act-3', descripcion: 'Implementación piloto en campo y talleres', fechaInicio: '2026-10-01T00:00:00.000Z', fechaFin: '2027-02-28T00:00:00.000Z', responsable: 'Dra. María Torres' }
        ],
        firmasResponsabilidad: {
            directorNota: 'Dr. Isaac Maisincho',
            directorCarrera: 'Dr. Ramiro Alcocer',
            coordinadorVinculacion: 'Ing. Silvia Vallejo',
            directorDepartamento: 'Dra. Elsa Medina'
        },
        estado: 'registrada',
        creadoEn: '2026-07-11T12:00:00.000Z',
        actualizadoEn: '2026-07-11T12:00:00.000Z'
    },
    {
        codigo: 'NC-2026-X8Y9',
        convocatoriaId: 'conv-2026',
        nombreProyecto: 'Plataforma Web para el Fortalecimiento del Comercio Justo en Organizaciones de Mujeres',
        sedeUnidadAcademica: 'Matriz Sangolquí',
        departamento: 'Ciencias de la Computación',
        plazoEjecucion: {
            fechaInicio: '2026-04-01T00:00:00.000Z',
            fechaFin: '2026-12-31T00:00:00.000Z'
        },
        directorId: 'dir-2',
        localizacion: {
            cobertura: 'Cantonal',
            provincia: 'Pichincha',
            canton: 'Quito',
            detalleUbicacion: 'Mercados comunitarios del sur y centro de Quito'
        },
        sectorPoblacion: {
            urbanoMarginal: true,
            rural: false,
            grupoAtencionPrioritaria: true
        },
        alineamiento: {
            ambitosPrioritarios: ['Desarrollo sostenible', 'Equidad de género'],
            objetivosODS2030: ['Igualdad de género (ODS 5)', 'Trabajo decente y crecimiento económico (ODS 8)'],
            camposCineUnesco: ['Ciencias comerciales y administración'],
            objetivosPND: ['Eje Social: Inclusión, equidad y empoderamiento social'],
            objetivosGAD: ['Objetivo 2: Reactivación económica solidaria local'],
            objetivosPlanEstrategico: ['Línea de investigación institucional 1: Impacto social'],
            lineasInvestigacion: ['Sistemas de Información y Software', 'Economía Popular y Solidaria'],
            dominioAcademico: ['Desarrollo Humano y Social']
        },
        departamentosParticipantes: ['dep-ciencias-computacion', 'dep-ciencias-economicas'],
        carrerasParticipantes: ['car-software', 'car-economia'],
        impactosEsperados: {
            economico: 'Incremento del 20% en ventas directas de las artesanas mediante canales digitales.',
            social: 'Reducción de intermediarios en la comercialización de productos artesanales.',
            politico: 'Fortalecimiento de la red de economía solidaria con el GAD del cantón.',
            cientifico: 'Sistematización de la experiencia en un caso de estudio publicado.',
            ambiental: 'Promoción de empaques biodegradables ecológicos.',
            otros: 'Capacitación digital avanzada para mujeres líderes.'
        },
        caracterizacionPoblacion: {
            poblacionReferencia: 1500,
            poblacionPotencial: 800,
            poblacionObjetivo: 150
        },
        presupuesto: {
            items: [
                { id: 'item-1', descripcion: 'Licencias de software de diseño y e-commerce', cantidad: 5, valorUnitario: 150.00, total: 750.00 },
                { id: 'item-2', descripcion: 'Tabletas para registro de inventarios en campo', cantidad: 3, valorUnitario: 220.00, total: 660.00 },
                { id: 'item-3', descripcion: 'Material publicitario y catálogos de productos', cantidad: 100, valorUnitario: 4.50, total: 450.00 }
            ],
            aporteEntidadAuspiciante: 200.00
        },
        cronograma: [
            { id: 'act-1', descripcion: 'Levantamiento de requerimientos y catálogo de productos', fechaInicio: '2026-04-01T00:00:00.000Z', fechaFin: '2026-05-31T00:00:00.000Z', responsable: 'Dra. María Torres' },
            { id: 'act-2', descripcion: 'Diseño e integración de pasarela de pagos', fechaInicio: '2026-06-01T00:00:00.000Z', fechaFin: '2026-09-30T00:00:00.000Z', responsable: 'Ing. José Pérez' }
        ],
        firmasResponsabilidad: {
            directorNota: 'Dra. María Torres',
            directorCarrera: 'Dr. Ramiro Alcocer',
            coordinadorVinculacion: 'Ing. Silvia Vallejo',
            directorDepartamento: 'Dra. Elsa Medina'
        },
        estado: 'en revisión',
        creadoEn: '2026-07-11T14:30:00.000Z',
        actualizadoEn: '2026-07-11T14:30:00.000Z'
    },
    {
        codigo: 'NC-2026-Z7W2',
        convocatoriaId: 'conv-2026',
        nombreProyecto: 'Sistema Remoto de Alerta Temprana de Deslaves y Desbordamiento de Ríos',
        sedeUnidadAcademica: 'Matriz Sangolquí',
        departamento: 'Ciencias de la Computación',
        plazoEjecucion: {
            fechaInicio: '2026-01-15T00:00:00.000Z',
            fechaFin: '2026-12-15T00:00:00.000Z'
        },
        directorId: 'dir-1',
        localizacion: {
            cobertura: 'Cantonal',
            provincia: 'Pichincha',
            canton: 'Rumiñahui',
            detalleUbicacion: 'Laderas del Cotopaxi y riberas del Río Santa Clara'
        },
        sectorPoblacion: {
            urbanoMarginal: false,
            rural: true,
            grupoAtencionPrioritaria: true
        },
        alineamiento: {
            ambitosPrioritarios: ['Desarrollo sostenible', 'Innovación tecnológica', 'Medio ambiente y biodiversidad'],
            objetivosODS2030: ['Ciudades y comunidades sostenibles (ODS 11)', 'Acción por el clima (ODS 13)'],
            camposCineUnesco: ['Protección del medio ambiente (general)'],
            objetivosPND: ['Eje Seguridad: Gestión de riesgos y resiliencia territorial'],
            objetivosGAD: ['Objetivo 3: Mitigación de riesgos y desastres naturales'],
            objetivosPlanEstrategico: ['Línea de investigación institucional 2: Tecnologías emergentes'],
            lineasInvestigacion: ['Sistemas de Información y Software', 'Gestión de Riesgos'],
            dominioAcademico: ['Seguridad y Gestión Ambiental']
        },
        departamentosParticipantes: ['dep-ciencias-computacion', 'dep-ciencias-tierra'],
        carrerasParticipantes: ['car-software', 'car-geologia'],
        impactosEsperados: {
            economico: 'Reducción de pérdidas materiales mediante alertas preventivas.',
            social: 'Evacuación a tiempo de más de 1200 personas vulnerables.',
            politico: 'Integración del sistema de alerta con la Secretaría de Gestión de Riesgos GAD Rumiñahui.',
            cientifico: 'Desarrollo de algoritmos de predicción basados en sensores telemétricos.',
            ambiental: 'Monitoreo ecológico de las cuencas de los ríos locales.',
            otros: 'Material de tesis de grado para tres estudiantes de ingeniería.'
        },
        caracterizacionPoblacion: {
            poblacionReferencia: 12000,
            poblacionPotencial: 5000,
            poblacionObjetivo: 1500
        },
        presupuesto: {
            items: [
                { id: 'item-1', descripcion: 'Estaciones meteorológicas y sensores de caudal telemétricos', cantidad: 4, valorUnitario: 1250.00, total: 5000.00 },
                { id: 'item-2', descripcion: 'Sirenas de alta potencia y antenas de largo alcance', cantidad: 2, valorUnitario: 1800.00, total: 3600.00 },
                { id: 'item-3', descripcion: 'Paneles solares y baterías recargables para estaciones', cantidad: 4, valorUnitario: 350.00, total: 1400.00 },
                { id: 'item-4', descripcion: 'Servicios de telecomunicaciones móviles 4G (1 año)', cantidad: 4, valorUnitario: 120.00, total: 480.00 }
            ],
            aporteEntidadAuspiciante: 3000.00
        },
        cronograma: [
            { id: 'act-1', descripcion: 'Estudios de campo y geolocalización de puntos críticos', fechaInicio: '2026-01-15T00:00:00.000Z', fechaFin: '2026-03-15T00:00:00.000Z', responsable: 'Dr. Isaac Maisincho' },
            { id: 'act-2', descripcion: 'Instalación de estaciones físicas y sirenas', fechaInicio: '2026-03-16T00:00:00.000Z', fechaFin: '2026-06-30T00:00:00.000Z', responsable: 'Ing. José Pérez' },
            { id: 'act-3', descripcion: 'Pruebas de comunicación telemétrica y simulacros', fechaInicio: '2026-07-01T00:00:00.000Z', fechaFin: '2026-12-15T00:00:00.000Z', responsable: 'Dra. María Torres' }
        ],
        firmasResponsabilidad: {
            directorNota: 'Dr. Isaac Maisincho',
            directorCarrera: 'Dr. Ramiro Alcocer',
            coordinadorVinculacion: 'Ing. Silvia Vallejo',
            directorDepartamento: 'Dra. Elsa Medina'
        },
        estado: 'aprobada',
        creadoEn: '2026-07-11T10:00:00.000Z',
        actualizadoEn: '2026-07-11T10:00:00.000Z'
    }
];
// ── Accessors: Convocatorias ─────────────────────────────────
function obtenerConvocatorias() {
    return convocatorias;
}
function agregarConvocatoria(c) {
    convocatorias.push(c);
}
function buscarConvocatoriaPorId(id) {
    return convocatorias.find((c) => c.id === id);
}
// ── Accessors: Directores ────────────────────────────────────
function obtenerDirectores() {
    return directores;
}
function agregarDirector(d) {
    directores.push(d);
}
function buscarDirectorPorId(id) {
    return directores.find((d) => d.id === id);
}
// ── Accessors: Notas Conceptuales ────────────────────────────
function obtenerNotas() {
    return notas;
}
function agregarNota(n) {
    notas.push(n);
}
function buscarNotaPorCodigo(codigo) {
    return notas.find((n) => n.codigo === codigo);
}
function actualizarNota(codigo, parcial) {
    const indice = notas.findIndex((n) => n.codigo === codigo);
    if (indice === -1)
        return false;
    notas[indice] = { ...notas[indice], ...parcial };
    return true;
}
