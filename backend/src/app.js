// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import ciudadanoRoutes from './routes/ciudadano.routes.js';
import { notFound, errorHandler } from './middlewares/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Middlewares globales
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (fotos y QR generados)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Límite básico de peticiones
app.use('/api/', rateLimit({ windowMs: 60_000, max: 100 }));

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/ciudadanos', ciudadanoRoutes);

// Manejo de errores
app.use(notFound);
app.use(errorHandler);
