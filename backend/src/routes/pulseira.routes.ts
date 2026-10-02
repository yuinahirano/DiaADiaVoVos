import { Router } from "express";
import { PulseiraController } from "../controller/pulseira.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";
import { requireCuidador } from "../middlewares/role.middlewares";

const PulseiraRoutes = Router();
const pulseiraController = new PulseiraController();

// Autenticação obrigatória em todas as rotas
PulseiraRoutes.use(authMiddleware);

// Usa arrow function em vez de passar o método direto (ex: pulseiraController.selecionar)
// porque o Express chama a função sem o objeto original, perdendo o "this";
// a arrow function garante que o método sempre execute com o "this" correto
PulseiraRoutes.get('/pulseira', (req, res) => pulseiraController.selecionar(req, res));
PulseiraRoutes.get('/pulseira/:id', (req, res) => pulseiraController.selecionar(req, res));
PulseiraRoutes.get('/pulseira/:id/status', (req, res) => pulseiraController.status(req, res));

// Vincular: qualquer usuário autenticado (app mobile). Adicione requireCuidador se quiser restringir
PulseiraRoutes.post('/pulseira/:id/vincular', (req, res) => pulseiraController.vincular(req, res));

// Restrito a cuidador
PulseiraRoutes.post('/pulseira', requireCuidador, (req, res) => pulseiraController.criar(req, res));
PulseiraRoutes.put('/pulseira/:id', requireCuidador, (req, res) => pulseiraController.editar(req, res));
PulseiraRoutes.delete('/pulseira/:id', requireCuidador, (req, res) => pulseiraController.deletar(req, res));

export default PulseiraRoutes;