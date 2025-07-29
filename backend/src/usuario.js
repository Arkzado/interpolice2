import express from 'express';
import dbCnn from './conexion.js';
import bcrypt from 'bcrypt';

const usuarios = express.Router();

// Listar todos los usuarios con info del rol
usuarios.get("/usuario/listar", async (req, res) => {
    try {
        const consulta = `
            SELECT u.nombre, u.fecha_registro, u.estado, u.id_rol, r.rol 
            FROM usuario u
            LEFT JOIN roles r ON u.id_rol = r.id
            ORDER BY u.nombre
        `;
        const [resultado] = await dbCnn.query(consulta);
        res.status(200).send({
            estado: "ok",
            mensaje: "Lista de usuarios",
            data: resultado
        });
    } catch (err) {
        res.status(500).send({
            estado: "error",
            mensaje: "Error en la consulta",
            data: err.code,
            error: err.message
        });
    }
});

// Buscar usuario por nombre (clave única)
usuarios.get("/usuario/listar/:nombre", async (req, res) => {
    try {
        const nombre = req.params.nombre;
        const consulta = `
            SELECT u.nombre, u.fecha_registro, u.estado, u.id_rol, r.rol
            FROM usuario u
            LEFT JOIN roles r ON u.id_rol = r.id
            WHERE u.nombre = ?
        `;
        const [resultado] = await dbCnn.query(consulta, [nombre]);
        if (resultado.length > 0) {
            res.status(200).send({
                estado: "ok",
                mensaje: "Usuario encontrado",
                data: resultado[0]
            });
        } else {
            res.status(404).send({
                estado: "error",
                mensaje: "Usuario no encontrado",
                data: null
            });
        }
    } catch (err) {
        res.status(500).send({
            estado: "error",
            mensaje: "Error en la consulta",
            data: err.code,
            error: err.message
        });
    }
});

// Crear usuario
usuarios.post("/usuario/crear", async (req, res) => {
    try {
        const saltRounds = 10;
        const hashedPass = await bcrypt.hash(req.body.contrasena, saltRounds);

        const data = {
            nombre: req.body.nombre,
            contrasena: hashedPass,
            fecha_registro: new Date(), // hoy
            id_rol: req.body.id_rol || 2,
            estado: 0  // activo por defecto
        };

        const consulta = "INSERT INTO usuario SET ?";
        const [resultado] = await dbCnn.query(consulta, [data]);

        if (resultado.affectedRows > 0) {
            res.status(201).send({
                estado: "ok",
                mensaje: "Usuario creado",
                data: {
                    nombre: data.nombre,
                    id_rol: data.id_rol,
                    estado: data.estado,
                    fecha_registro: data.fecha_registro
                }
            });
        } else {
            res.status(400).send({
                estado: "error",
                mensaje: "No se pudo crear el usuario",
                data: null
            });
        }
    } catch (err) {
        res.status(500).send({
            estado: "error",
            mensaje: "Error en la consulta",
            data: err.code,
            error: err.message
        });
    }
});

// Actualizar usuario (por nombre)
usuarios.put("/usuario/actualizar/:nombre", async (req, res) => {
    try {
        const nombre = req.params.nombre;

        const data = {
            id_rol: req.body.id_rol || null,
            estado: req.body.estado !== undefined ? req.body.estado : null
        };

        if (req.body.contrasena) {
            const saltRounds = 10;
            const hashedPass = await bcrypt.hash(req.body.contrasena, saltRounds);
            data.contrasena = hashedPass;
        }

        // Limpiar las propiedades null para no sobrescribir con null
        Object.keys(data).forEach(key => data[key] === null && delete data[key]);

        const consulta = "UPDATE usuario SET ? WHERE nombre = ?";
        const [resultado] = await dbCnn.query(consulta, [data, nombre]);

        if (resultado.affectedRows > 0) {
            res.status(200).send({
                estado: "ok",
                mensaje: "Usuario actualizado",
                data: { nombre, ...data }
            });
        } else {
            res.status(404).send({
                estado: "error",
                mensaje: "Usuario no encontrado",
                data: null
            });
        }
    } catch (err) {
        res.status(500).send({
            estado: "error",
            mensaje: "Error en la consulta",
            data: err.code,
            error: err.message
        });
    }
});

// Eliminar usuario (marcar estado=1)
usuarios.delete("/usuario/eliminar/:nombre", async (req, res) => {
    try {
        const nombre = req.params.nombre;
        const consulta = "UPDATE usuario SET estado = 1 WHERE nombre = ?";
        const [resultado] = await dbCnn.query(consulta, [nombre]);

        if (resultado.affectedRows > 0) {
            res.status(200).send({
                estado: "ok",
                mensaje: "Usuario eliminado",
                data: { nombre }
            });
        } else {
            res.status(404).send({
                estado: "error",
                mensaje: "Usuario no encontrado",
                data: null
            });
        }
    } catch (err) {
        res.status(500).send({
            estado: "error",
            mensaje: "Error en la consulta",
            data: err.code,
            error: err.message
        });
    }
});

// Listar roles
usuarios.get("/roles/listar", async (req, res) => {
    try {
        const consulta = "SELECT * FROM roles ORDER BY id";
        const [resultado] = await dbCnn.query(consulta);
        res.status(200).send({
            estado: "ok",
            mensaje: "Lista de roles",
            data: resultado
        });
    } catch (err) {
        res.status(500).send({
            estado: "error",
            mensaje: "Error en la consulta",
            data: err.code,
            error: err.message
        });
    }
});

// Login
usuarios.post("/usuario/login", async (req, res) => {
    try {
        const { nombre, contrasena } = req.body;
        if (!nombre || !contrasena) {
            return res.status(400).send({
                estado: "error",
                mensaje: "Nombre y contraseña son requeridos",
                data: null
            });
        }

        const consulta = `
            SELECT u.nombre, u.contrasena, u.estado, u.id_rol, r.rol
            FROM usuario u
            LEFT JOIN roles r ON u.id_rol = r.id
            WHERE u.nombre = ? AND u.estado != 1
        `;
        const [resultado] = await dbCnn.query(consulta, [nombre]);

        if (resultado.length === 0) {
            return res.status(401).send({
                estado: "error",
                mensaje: "Usuario o contraseña incorrectos",
                data: null
            });
        }

        const usuarioEncontrado = resultado[0];
        const passwordValida = await bcrypt.compare(contrasena, usuarioEncontrado.contrasena);

        if (!passwordValida) {
            return res.status(401).send({
                estado: "error",
                mensaje: "Usuario o contraseña incorrectos",
                data: null
            });
        }

        res.status(200).send({
            estado: "ok",
            mensaje: "Login exitoso",
            data: {
                nombre: usuarioEncontrado.nombre,
                id_rol: usuarioEncontrado.id_rol,
                rol: usuarioEncontrado.rol
            }
        });

    } catch (err) {
        res.status(500).send({
            estado: "error",
            mensaje: "Error en el servidor",
            data: err.code,
            error: err.message
        });
    }
});

export default usuarios;
