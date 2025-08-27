// src/routes/auth.routes.js
import { Router } from 'express';
import { login, seedAdmin } from '../controllers/auth.controller.js';

const r = Router();

r.post('/login', login);
r.post('/seed-admin', seedAdmin);

export default r;  // 👈 necesario
