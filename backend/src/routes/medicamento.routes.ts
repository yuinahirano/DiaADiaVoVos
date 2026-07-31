import { Router } from "express";
import { MedicamentoController } from "../controller/medicamento.controller";
const medicamentoRoutes = Router();

const medicamentoController = new (MedicamentoController);

medicamentoRoutes.get('/medicamento', medicamentoController.selecionar);
medicamentoRoutes.get('/medicamento/:id', medicamentoController.selecionar);
medicamentoRoutes.post('/medicamento', medicamentoController.criar);
medicamentoRoutes.put('/medicamento/:id', medicamentoController.editar);
medicamentoRoutes.delete('/medicamento/:id',medicamentoController.deletar);
    
export default medicamentoRoutes;