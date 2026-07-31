import { Router } from "express";
import {IdosoController } from "../controller/idoso.controller";
const idosoRoutes = Router();

const idosoController = new IdosoController();

idosoRoutes.get('/idosos', idosoController.selecionar);
idosoRoutes.get('/idosos/:id', idosoController.selecionar);
idosoRoutes.post('/idosos', idosoController.criar);
idosoRoutes.put('/idosos/:id', idosoController.editar);
idosoRoutes.delete('/idosos/:id',idosoController.deletar);
    
export default idosoRoutes;