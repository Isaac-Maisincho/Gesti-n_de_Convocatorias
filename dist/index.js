"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const convocatorias_service_1 = require("./servicios/convocatorias.service");
const directores_service_1 = require("./servicios/directores.service");
const notas_service_1 = require("./servicios/notas.service");
const estadisticas_service_1 = require("./servicios/estadisticas.service");
const catalogos_json_1 = __importDefault(require("./data/catalogos.json"));
const departamentos_carreras_json_1 = __importDefault(require("./data/departamentos-carreras.json"));
const ubicaciones_json_1 = __importDefault(require("./data/ubicaciones.json"));
const app = (0, express_1.default)();
const publicPath = path_1.default.join(__dirname, 'public');
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(publicPath));
app.get('/', (req, res) => {
    return res.sendFile(path_1.default.join(publicPath, 'index.html'));
});
// ============================================================
// /api/convocatorias
// ============================================================
app.get('/api/convocatorias', (req, res) => {
    const resultado = (0, convocatorias_service_1.listarConvocatorias)();
    res.status(200).json(resultado);
});
app.post('/api/convocatorias', (req, res) => {
    try {
        const resultado = (0, convocatorias_service_1.crearConvocatoria)(req.body);
        if (!resultado.exito) {
            return res.status(400).json(resultado);
        }
        res.status(201).json(resultado);
    }
    catch (err) {
        res.status(400).json({ exito: false, mensaje: 'Error al procesar la solicitud. Verifique el formato JSON.' });
    }
});
// ============================================================
// /api/catalogos
// ============================================================
app.get('/api/catalogos', (req, res) => {
    res.status(200).json({
        exito: true,
        mensaje: 'Catálogos de alineamiento obtenidos exitosamente.',
        datos: catalogos_json_1.default,
    });
});
// ============================================================
// /api/departamentos-carreras
// ============================================================
app.get('/api/departamentos-carreras', (req, res) => {
    res.status(200).json({
        exito: true,
        mensaje: 'Departamentos y carreras obtenidos exitosamente.',
        datos: departamentos_carreras_json_1.default,
    });
});
// ============================================================
// /api/directores
// ============================================================
app.get('/api/directores', (req, res) => {
    const resultado = (0, directores_service_1.listarDirectores)();
    res.status(200).json(resultado);
});
app.post('/api/directores', (req, res) => {
    try {
        const resultado = (0, directores_service_1.registrarDirector)(req.body);
        if (!resultado.exito) {
            return res.status(400).json(resultado);
        }
        res.status(201).json(resultado);
    }
    catch (err) {
        res.status(400).json({ exito: false, mensaje: 'Error al procesar la solicitud. Verifique el formato JSON.' });
    }
});
// ============================================================
// /api/estadisticas/presupuesto-general
// ============================================================
app.get('/api/estadisticas/presupuesto-general', (req, res) => {
    const resultado = (0, estadisticas_service_1.obtenerPresupuestoGeneral)();
    res.status(200).json(resultado);
});
// ============================================================
// /api/notas
// ============================================================
app.get('/api/notas', (req, res) => {
    const pagina = req.query.pagina ? parseInt(req.query.pagina, 10) : 1;
    const limite = req.query.limite ? parseInt(req.query.limite, 10) : 10;
    const resultado = (0, notas_service_1.listarNotas)({ pagina, limite });
    res.status(200).json(resultado);
});
app.post('/api/notas', (req, res) => {
    try {
        const resultado = (0, notas_service_1.crearNota)(req.body);
        if (!resultado.exito) {
            return res.status(400).json(resultado);
        }
        res.status(201).json(resultado);
    }
    catch (err) {
        res.status(400).json({ exito: false, mensaje: 'Error al procesar la solicitud. Verifique el formato JSON.' });
    }
});
// ============================================================
// /api/notas/:codigo
// ============================================================
app.get('/api/notas/:codigo', (req, res) => {
    const { codigo } = req.params;
    const resultado = (0, notas_service_1.obtenerNotaPorCodigo)(codigo);
    if (!resultado.exito) {
        return res.status(404).json(resultado);
    }
    res.status(200).json(resultado);
});
// ============================================================
// /api/notas/:codigo/estado
// ============================================================
app.patch('/api/notas/:codigo/estado', (req, res) => {
    try {
        const { codigo } = req.params;
        const { estado } = req.body;
        const resultado = (0, notas_service_1.cambiarEstadoNota)(codigo, estado);
        if (!resultado.exito) {
            return res.status(400).json(resultado);
        }
        res.status(200).json(resultado);
    }
    catch (err) {
        res.status(400).json({ exito: false, mensaje: 'Error al procesar la solicitud. Verifique el formato JSON.' });
    }
});
// ============================================================
// /api/notas/:codigo/presupuesto-total
// ============================================================
app.get('/api/notas/:codigo/presupuesto-total', (req, res) => {
    const { codigo } = req.params;
    const resultado = (0, notas_service_1.obtenerPresupuestoTotal)(codigo);
    if (!resultado.exito) {
        return res.status(404).json(resultado);
    }
    res.status(200).json(resultado);
});
// ============================================================
// /api/ubicaciones
// ============================================================
const provincias = ubicaciones_json_1.default;
app.get('/api/ubicaciones', (req, res) => {
    const provinciaId = req.query.provinciaId;
    const cantonId = req.query.cantonId;
    if (provinciaId && cantonId) {
        const prov = provincias.find((p) => p.id === provinciaId);
        if (!prov) {
            return res.status(404).json({ exito: false, mensaje: `Provincia "${provinciaId}" no encontrada.` });
        }
        const canton = prov.cantones.find((c) => c.id === cantonId);
        if (!canton) {
            return res.status(404).json({ exito: false, mensaje: `Cantón "${cantonId}" no encontrado en la provincia "${prov.nombre}".` });
        }
        return res.status(200).json({
            exito: true,
            mensaje: `Parroquias del cantón "${canton.nombre}", provincia "${prov.nombre}".`,
            datos: { provincia: prov.nombre, canton: canton.nombre, parroquias: canton.parroquias },
        });
    }
    if (provinciaId) {
        const prov = provincias.find((p) => p.id === provinciaId);
        if (!prov) {
            return res.status(404).json({ exito: false, mensaje: `Provincia "${provinciaId}" no encontrada.` });
        }
        return res.status(200).json({
            exito: true,
            mensaje: `Cantones de la provincia "${prov.nombre}".`,
            datos: {
                provincia: prov.nombre,
                cantones: prov.cantones.map((c) => ({ id: c.id, nombre: c.nombre })),
            },
        });
    }
    return res.status(200).json({
        exito: true,
        mensaje: 'Provincias obtenidas exitosamente.',
        datos: provincias.map((p) => ({ id: p.id, nombre: p.nombre })),
    });
});
app.use((req, res) => {
    if (req.accepts('html')) {
        return res.sendFile(path_1.default.join(publicPath, 'index.html'));
    }
    res.status(404).json({
        exito: false,
        mensaje: 'Ruta no encontrada. Use / o /api/* para acceder a la aplicación.',
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
