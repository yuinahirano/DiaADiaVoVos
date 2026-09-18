import { Router } from "express";
import { ConsultaController } from "../controller/consulta.controller";
<<<<<<< HEAD
const consultaRoutes = Router();

const consultaController = new (ConsultaController);

consultaRoutes.get('/consulta', consultaController.selecionar);
consultaRoutes.get('/consulta/:id', consultaController.selecionar);
consultaRoutes.post('/consulta', consultaController.criar);
consultaRoutes.put('/consulta/:id', consultaController.editar);
consultaRoutes.delete('/consulta/:id',consultaController.deletar);
    
=======
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

>>>>>>> 6267fb6640d639d94f17324c76df5f279f3f574f
export default consultaRoutes;