export function hasRole(...roles) {
return (req, res, next) => {
if (!req.user || !roles.includes(req.user.rol)) {
return res.status(403).json({ error: 'Sin permisos' });
}
next();
};
}