import express from 'express';
import cors from 'cors';
import path from 'path';
import { crearConvocatoria, listarConvocatorias } from '@/servicios/convocatorias.service';
import { registrarDirector, listarDirectores } from '@/servicios/directores.service';
import {
  crearNota,
  listarNotas,
  obtenerNotaPorCodigo,
  cambiarEstadoNota,
  obtenerPresupuestoTotal,
  agregarItemPresupuesto,
  agregarActividadCronograma,
  actualizarNotaParcial,
} from '@/servicios/notas.service';
import { obtenerPresupuestoGeneral } from '@/servicios/estadisticas.service';
import catalogosData from '@/data/catalogos.json';
import deptCarrerasData from '@/data/departamentos-carreras.json';
import ubicacionesData from '@/data/ubicaciones.json';
import type { Provincia } from '@/models/interfaces';

const app = express();
const publicPath = path.join(__dirname, 'public');

app.use(cors());
app.use(express.json());
app.use(express.static(publicPath));

app.get('/', (req, res) => {
  return res.sendFile(path.join(publicPath, 'index.html'));
});

// ============================================================
// /api/convocatorias
// ============================================================
app.get('/api/convocatorias', (req, res) => {
  const resultado = listarConvocatorias();
  res.status(200).json(resultado);
});

app.post('/api/convocatorias', (req, res) => {
  try {
    const resultado = crearConvocatoria(req.body);
    if (!resultado.exito) {
      return res.status(400).json(resultado);
    }
    res.status(201).json(resultado);
  } catch (err) {
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
    datos: catalogosData,
  });
});

// ============================================================
// /api/departamentos-carreras
// ============================================================
app.get('/api/departamentos-carreras', (req, res) => {
  res.status(200).json({
    exito: true,
    mensaje: 'Departamentos y carreras obtenidos exitosamente.',
    datos: deptCarrerasData,
  });
});

// ============================================================
// /api/directores
// ============================================================
app.get('/api/directores', (req, res) => {
  const resultado = listarDirectores();
  res.status(200).json(resultado);
});

app.post('/api/directores', (req, res) => {
  try {
    const resultado = registrarDirector(req.body);
    if (!resultado.exito) {
      return res.status(400).json(resultado);
    }
    res.status(201).json(resultado);
  } catch (err) {
    res.status(400).json({ exito: false, mensaje: 'Error al procesar la solicitud. Verifique el formato JSON.' });
  }
});

// ============================================================
// /api/estadisticas/presupuesto-general
// ============================================================
app.get('/api/estadisticas/presupuesto-general', (req, res) => {
  const resultado = obtenerPresupuestoGeneral();
  res.status(200).json(resultado);
});

// ============================================================
// /api/notas
// ============================================================
app.get('/api/notas', (req, res) => {
  const pagina = req.query.pagina ? parseInt(req.query.pagina as string, 10) : 1;
  const limite = req.query.limite ? parseInt(req.query.limite as string, 10) : 10;
  const resultado = listarNotas({ pagina, limite });
  res.status(200).json(resultado);
});

app.post('/api/notas', (req, res) => {
  try {
    const resultado = crearNota(req.body);
    if (!resultado.exito) {
      return res.status(400).json(resultado);
    }
    res.status(201).json(resultado);
  } catch (err) {
    res.status(400).json({ exito: false, mensaje: 'Error al procesar la solicitud. Verifique el formato JSON.' });
  }
});

// ============================================================
// /api/notas/:codigo
// ============================================================
app.get('/api/notas/:codigo', (req, res) => {
  const { codigo } = req.params;
  const resultado = obtenerNotaPorCodigo(codigo);
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
    const resultado = cambiarEstadoNota(codigo, estado);
    if (!resultado.exito) {
      return res.status(400).json(resultado);
    }
    res.status(200).json(resultado);
  } catch (err) {
    res.status(400).json({ exito: false, mensaje: 'Error al procesar la solicitud. Verifique el formato JSON.' });
  }
});

// ============================================================
// /api/notas/:codigo
// ============================================================
app.patch('/api/notas/:codigo', (req, res) => {
  try {
    const { codigo } = req.params;
    const resultado = actualizarNotaParcial(codigo, req.body);
    if (!resultado.exito) {
      return res.status(400).json(resultado);
    }
    res.status(200).json(resultado);
  } catch (err) {
    res.status(400).json({ exito: false, mensaje: 'Error al procesar la solicitud. Verifique el formato JSON.' });
  }
});

// ============================================================
// /api/notas/:codigo/presupuesto
// ============================================================
app.post('/api/notas/:codigo/presupuesto', (req, res) => {
  try {
    const { codigo } = req.params;
    const resultado = agregarItemPresupuesto(codigo, req.body);
    if (!resultado.exito) {
      return res.status(400).json(resultado);
    }
    res.status(201).json(resultado);
  } catch (err) {
    res.status(400).json({ exito: false, mensaje: 'Error al procesar la solicitud. Verifique el formato JSON.' });
  }
});

// ============================================================
// /api/notas/:codigo/cronograma
// ============================================================
app.post('/api/notas/:codigo/cronograma', (req, res) => {
  try {
    const { codigo } = req.params;
    const resultado = agregarActividadCronograma(codigo, req.body);
    if (!resultado.exito) {
      return res.status(400).json(resultado);
    }
    res.status(201).json(resultado);
  } catch (err) {
    res.status(400).json({ exito: false, mensaje: 'Error al procesar la solicitud. Verifique el formato JSON.' });
  }
});

// ============================================================
// /api/notas/:codigo/presupuesto-total
// ============================================================
app.get('/api/notas/:codigo/presupuesto-total', (req, res) => {
  const { codigo } = req.params;
  const resultado = obtenerPresupuestoTotal(codigo);
  if (!resultado.exito) {
    return res.status(404).json(resultado);
  }
  res.status(200).json(resultado);
});

// ============================================================
// /api/ubicaciones
// ============================================================
const provincias: Provincia[] = ubicacionesData as Provincia[];
app.get('/api/ubicaciones', (req, res) => {
  const provinciaId = req.query.provinciaId as string | undefined;
  const cantonId = req.query.cantonId as string | undefined;

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
    return res.sendFile(path.join(publicPath, 'index.html'));
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
