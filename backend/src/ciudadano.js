import express from "express";
import connection from "./conexion.js";

const ciudadano = express.Router();

ciudadano.get("/saludo", (req, res) =>{
    res.send("hola mundo");
});

export default ciudadano;