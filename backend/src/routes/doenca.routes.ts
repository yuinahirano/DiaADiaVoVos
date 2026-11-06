import { Router } from "express";
import { DoencaController } from "../controller/doenca.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";
import { requireCuidador } from "../middlewares/role.middlewares";

const DoencaRoutes = Router();
const doencaController = new DoencaController();

DoencaRoutes.use(authMiddleware);

DoencaRoutes.get('/doenca', (req, res) => doencaController.selecionar(req, res));

DoencaRoutes.get('/doenca/usuario/:idUsuario', (req, res) => doencaController.selecionarPorUsuario(req, res));

DoencaRoutes.get('/doenca/:id', (req, res) => doencaController.selecionar(req, res));

DoencaRoutes.post('/doenca', requireCuidador, (req, res) => doencaController.criar(req, res));
DoencaRoutes.put('/doenca/:id', requireCuidador, (req, res) => doencaController.editar(req, res));
DoencaRoutes.delete('/doenca/:id', requireCuidador, (req, res) => doencaController.deletar(req, res));

export default DoencaRoutes;