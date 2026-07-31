import { Router } from "express";
import { ReceitaMedicaController } from "../controller/receitaMedica.controller";
const receitaRoutes = Router();

const receitaController = new (ReceitaMedicaController);

receitaRoutes.get('/receita', receitaController.selecionar);
receitaRoutes.get('/receita/:id', receitaController.selecionar);
receitaRoutes.post('/receita', receitaController.criar);
receitaRoutes.put('/receita/:id', receitaController.editar);
receitaRoutes.delete('/receita/:id',receitaController.deletar);
    
export default receitaRoutes;