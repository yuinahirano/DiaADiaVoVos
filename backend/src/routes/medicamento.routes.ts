import { Router } from "express";
import { MedicamentoController } from "../controller/medicamento.controller";
<<<<<<< HEAD
const medicamentoRoutes = Router();

const medicamentoController = new (MedicamentoController);

medicamentoRoutes.get('/medicamento', medicamentoController.selecionar);
medicamentoRoutes.get('/medicamento/:id', medicamentoController.selecionar);
medicamentoRoutes.post('/medicamento', medicamentoController.criar);
medicamentoRoutes.put('/medicamento/:id', medicamentoController.editar);
medicamentoRoutes.delete('/medicamento/:id',medicamentoController.deletar);
    
=======
import { authMiddleware } from "../middlewares/auth.middlewares";
import { requireCuidador } from "../middlewares/role.middlewares";

const medicamentoRoutes = Router();
const medicamentoController = new MedicamentoController();

medicamentoRoutes.get("/medicamento", (req, res) => medicamentoController.selecionar(req, res));
medicamentoRoutes.get("/medicamento/idosos/:idIdoso", (req, res) => medicamentoController.selecionarPorIdoso(req, res));
medicamentoRoutes.get("/medicamento/:id", (req, res) => medicamentoController.selecionar(req, res));

medicamentoRoutes.post("/medicamento", authMiddleware, requireCuidador, (req, res) => medicamentoController.criar(req, res));
medicamentoRoutes.put("/medicamento/:id", authMiddleware, requireCuidador, (req, res) => medicamentoController.editar(req, res));
medicamentoRoutes.delete("/medicamento/:id", authMiddleware, requireCuidador, (req, res) => medicamentoController.deletar(req, res));

>>>>>>> 6267fb6640d639d94f17324c76df5f279f3f574f
export default medicamentoRoutes;