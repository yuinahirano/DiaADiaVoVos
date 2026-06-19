import { Router } from "express";
import {  IdosoController } from "../controller/idosoCuidador.controller";
const idosoCuidadorRoutes = Router();

const cuiadorController = new IdosoController();

idosoCuidadorRoutes.get('/idosoCuidador', cuiadorController.selecionar);
idosoCuidadorRoutes.get('/idosoCuidador/:id', cuiadorController.selecionar);
idosoCuidadorRoutes.post('/idosoCuidador', cuiadorController.criar);
idosoCuidadorRoutes.put('/idosoCuidador/:id', cuiadorController.editar);
idosoCuidadorRoutes.delete('/idosoCuidador/:id',cuiadorController.deletar);
    
export default idosoCuidadorRoutes;