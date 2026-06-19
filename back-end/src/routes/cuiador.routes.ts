import { Router } from "express";
import {  CuidadorController } from "../controller/cuiador.controller";
const cuidadorRoutes = Router();

const cuiadorController = new CuidadorController();

cuidadorRoutes.get('/cuidadores', cuiadorController.selecionar);
cuidadorRoutes.get('/cuidadores/:id', cuiadorController.selecionar);
cuidadorRoutes.post('/cuidadores', cuiadorController.criar);
cuidadorRoutes.put('/cuidadores/:id', cuiadorController.editar);
cuidadorRoutes.delete('/cuidadores/:id',cuiadorController.deletar);
    
export default cuidadorRoutes;