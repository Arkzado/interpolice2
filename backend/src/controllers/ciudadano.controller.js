import { Ciudadano } from '../models/index.js';
import { generarQR } from '../services/qr.js';


const base = process.env.BASE_URL || 'http://localhost:3000';


export async function createCiudadano(req, res) {
const data = req.body;
if (req.file) data.foto = `/${req.file.path.replace(/\\/g,'/')}`;


const url = `${base}/api/ciudadanos/codigo/${encodeURIComponent(data.codigo)}`;
const qrPath = await generarQR(url, `ciudadano-${data.codigo}`);
data.qr = `/${qrPath.replace(/\\/g,'/')}`;


const nuevo = await Ciudadano.create(data);
res.status(201).json(nuevo);
}


export async function listCiudadanos(req, res) {
const list = await Ciudadano.findAll({ order: [['id','DESC']] });
res.json(list);
}


export async function getCiudadano(req, res) {
const { id } = req.params;
const item = await Ciudadano.findByPk(id);
if (!item) return res.status(404).json({ error: 'No existe' });
res.json(item);
}


export async function getByCodigo(req, res) {
const { codigo } = req.params;
const item = await Ciudadano.findOne({ where: { codigo } });
if (!item) return res.status(404).json({ error: 'No existe' });
res.json(item);
}


export async function updateCiudadano(req, res) {
const { id } = req.params;
const item = await Ciudadano.findByPk(id);
if (!item) return res.status(404).json({ error: 'No existe' });


const data = req.body;
if (req.file) data.foto = `/${req.file.path.replace(/\\/g,'/')}`;
if (data.codigo && data.codigo !== item.codigo) {
const url = `${base}/api/ciudadanos/codigo/${encodeURIComponent(data.codigo)}`;
const qrPath = await generarQR(url, `ciudadano-${data.codigo}`);
data.qr = `/${qrPath.replace(/\\/g,'/')}`;
}
await item.update(data);
res.json(item);
}


export async function deleteCiudadano(req, res) {
const { id } = req.params;
const item = await Ciudadano.findByPk(id);
if (!item) return res.status(404).json({ error: 'No existe' });
await item.destroy();
res.json({ ok: true });
}