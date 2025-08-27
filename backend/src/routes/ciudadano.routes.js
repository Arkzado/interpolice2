// src/routes/ciudadano.routes.js
import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { hasRole } from '../middlewares/roles.js';
import { upload } from '../middlewares/upload.js';
import {
  createCiudadano,
  listCiudadanos,
  getCiudadano,
  getByCodigo,
  updateCiudadano,
  deleteCiudadano
} from '../controllers/ciudadano.controller.js';

const r = Router();

r.get('/', authRequired, listCiudadanos);
r.get('/codigo/:codigo', getByCodigo); // público (para QR)
r.get('/:id', authRequired, getCiudadano);

r.post('/', authRequired, hasRole('ADMIN','POLICIA'), upload.single('foto'), createCiudadano);
r.put('/:id', authRequired, hasRole('ADMIN','POLICIA'), upload.single('foto'), updateCiudadano);
r.delete('/:id', authRequired, hasRole('ADMIN'), deleteCiudadano);

// 👇 importante para poder importarlo como default
export default r;
