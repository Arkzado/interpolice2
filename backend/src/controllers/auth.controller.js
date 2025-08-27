import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Rol, Usuario } from '../models/index.js';


export async function seedAdmin(req, res) {
const [adminRol] = await Rol.findOrCreate({ where: { nombre: 'ADMIN' } });
await Rol.findOrCreate({ where: { nombre: 'POLICIA' } });


const email = 'admin@interpolice.local';
const exists = await Usuario.findOne({ where: { email } });
if (!exists) {
const passwordHash = await bcrypt.hash('admin123', 10);
await Usuario.create({ nombre: 'Admin', email, passwordHash, rolId: adminRol.id });
}
res.json({ ok: true });
}


export async function login(req, res) {
const { email, password } = req.body;
const user = await Usuario.findOne({ where: { email }, include: Rol });
if (!user) return res.status(400).json({ error: 'Credenciales inválidas' });
const ok = await bcrypt.compare(password, user.passwordHash);
if (!ok) return res.status(400).json({ error: 'Credenciales inválidas' });


const token = jwt.sign({ id: user.id, rol: user.Rol?.nombre || 'POLICIA', email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TTL || '1d' });
res.json({ token });
}