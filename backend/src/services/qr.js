import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';


export async function generarQR(texto, nombre = 'qr') {
const dir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `${nombre}-${Date.now()}.png`);
await QRCode.toFile(file, texto, { width: 300 });
return file;
}