export function notFound(req, res) {
res.status(404).json({ error: 'No encontrado' });
}


export function errorHandler(err, req, res, next) {
console.error(err);
res.status(err.status || 500).json({ error: err.message || 'Error interno' });
}