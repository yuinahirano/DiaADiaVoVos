import { Router } from "express";
import { ConsultaController } from "../controller/consulta.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";
import { requireCuidador } from "../middlewares/role.middlewares";

const consultaRoutes = Router();
const consultaController = new ConsultaController();

// GET livre, sem autenticação
consultaRoutes.get('/consulta', consultaController.selecionar);
consultaRoutes.get('/consulta/:id', consultaController.selecionar);

// POST/PUT/DELETE continuam exigindo login + role cuidador
consultaRoutes.post('/consulta', authMiddleware, requireCuidador, (req, res) => consultaController.criar(req, res));
consultaRoutes.put('/consulta/:id', authMiddleware, requireCuidador, (req, res) => consultaController.editar(req, res));
consultaRoutes.delete('/consulta/:id', authMiddleware, requireCuidador, (req, res) => consultaController.deletar(req, res));

export default consultaRoutes;