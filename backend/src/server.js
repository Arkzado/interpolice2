import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';
import { connectDB } from './config/db.js';
import { syncModels } from './models/index.js';

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB();
    await syncModels();
    app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`));
  } catch (e) {
    console.error('No se pudo iniciar:', e);
    process.exit(1);
  }
})();