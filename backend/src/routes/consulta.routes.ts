import { Router } from "express";
import { ConsultaController } from "../controller/consulta.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";
import { requireCuidador } from "../middlewares/role.middlewares";

const consultaRoutes = Router();
const consultaController = new ConsultaController();

consultaRoutes.get('/consulta', consultaController.selecionar);

consultaRoutes.get('/consulta/idosos/:idIdoso', (req, res) => consultaController.selecionarPorIdoso(req, res));

consultaRoutes.get('/consulta/:id', consultaController.selecionar);

consultaRoutes.post('/consulta', authMiddleware, requireCuidador, (req, res) => consultaController.criar(req, res));
consultaRoutes.put('/consulta/:id', authMiddleware, requireCuidador, (req, res) => consultaController.editar(req, res));
consultaRoutes.patch('/consulta/:id/compareceu', authMiddleware, requireCuidador, (req, res) => consultaController.Compareceu(req, res));
consultaRoutes.delete('/consulta/:id', authMiddleware, requireCuidador, (req, res) => consultaController.deletar(req, res));

export default consultaRoutes;