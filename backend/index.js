import express from "express";
import cors from "cors";
import ciudadano from "./src/ciudadano.js";

const routerCiudadano = express();
const puertoCiudadano = 3000;

routerCiudadano.use(express.json());
routerCiudadano.use(cors());
routerCiudadano.use("/ciudadano", ciudadano);

routerCiudadano.get("/", (req, res) =>{
    res.send("todo bien");
})

routerCiudadano.listen(puertoCiudadano, async () =>{
    console.log(`http://localhost:${puertoCiudadano}: funciona`)
})