import express from "express";
import getConnection from "./conexion.js";

const ciudadano = express.Router();


ciudadano.get("/traerCiudadanos", async (req, res) =>{
    try{
        const connection = await getConnection();
        const [rows] = await connection.query("SELECT * FROM ciudadano");
        res.send(rows);
        connection.end();
    }
    catch(err){
        res.send(`error: ${err}`);
    }
});
ciudadano.get("/mostrar", (req, res) =>{
    res.send("hola mundo");
});

export default ciudadano;