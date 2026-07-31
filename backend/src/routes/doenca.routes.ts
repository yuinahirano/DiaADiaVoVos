import { Router } from "express";
import {  DoencaController } from "../controller/doenca.controller";
const DoencaRoutes = Router();

const doencaController = new DoencaController();

DoencaRoutes.get('/doenca', doencaController.selecionar);
DoencaRoutes.get('/doenca/:id', doencaController.selecionar);
DoencaRoutes.post('/doenca', doencaController.criar);
DoencaRoutes.put('/doenca/:id', doencaController.editar);
DoencaRoutes.delete('/doenca/:id',doencaController.deletar);

export default DoencaRoutes;