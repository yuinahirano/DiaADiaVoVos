import { Router } from "express";
import { ConsultaController } from "../controller/consulta.controller";
const consultaRoutes = Router();

const consultaController = new (ConsultaController);

consultaRoutes.get('/consulta', consultaController.selecionar);
consultaRoutes.get('/consulta/:id', consultaController.selecionar);
consultaRoutes.post('/consulta', consultaController.criar);
consultaRoutes.put('/consulta/:id', consultaController.editar);
consultaRoutes.delete('/consulta/:id',consultaController.deletar);
    
export default consultaRoutes;