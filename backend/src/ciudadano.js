import express from "express";
import getConnection from "./conexion.js";

const ciudadano = express.Router();


ciudadano.get("/traerCiudadanos", async (req, res) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query("SELECT * FROM ciudadano");
        res.send(rows);
        connection.end();
    }
    catch (err) {
        res.send(`error: ${err}`);
    }
});

ciudadano.post("/insertarCiudadano", async (req, res) => {
    try {
        const connection = await getConnection();
        const datosCiudadano = {
            nombre: req.body.nombre,
            apellidos: req.body.apellidos,
            apodo: req.body.apodo,
            fecha_nacimiento: req.body.fecha_nacimiento,
            planeta_origen: req.body.planeta_origen,
            planeta_residencia: req.body.planeta_residencia,
            foto: req.body.foto,
            codigo_qr: req.body.codigo_qr,
            estado: req.body.estado
        };
        const consulta = "INSERT INTO ciudadano SET ?";
        const [resultado] = await connection.query(consulta, [datosCiudadano]);

        res.send({
            estado: "ok",
            data: resultado,
        });
    }
    catch (err) {
        res.send({
            estado: "error",
            data: err
        })
    }
})

export default ciudadano;