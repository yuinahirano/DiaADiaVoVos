import { Router } from "express";
import { PulseiraController } from "../controller/pulseira.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";
import { requireCuidador } from "../middlewares/role.middlewares";
import { gerarDeviceTokenMiddleware } from "../middlewares/device.middlewares"; // ADAPTAR: nome do arquivo do deviceAuthMiddleware

const PulseiraRoutes = Router();
const pulseiraController = new PulseiraController();

// Autenticação obrigatória em todas as rotas
PulseiraRoutes.use(authMiddleware);

// Usa arrow function em vez de passar o método direto (ex: pulseiraController.selecionar)
// porque o Express chama a função sem o objeto original, perdendo o "this";
// a arrow function garante que o método sempre execute com o "this" correto
PulseiraRoutes.get('/pulseira', (req, res) => pulseiraController.selecionar(req, res));

// NOVO: pulseiras do usuário (o app lê o id do token e manda aqui)
PulseiraRoutes.get('/pulseira/usuario/:idUsuario', (req, res) => pulseiraController.selecionarPorUsuario(req, res));

PulseiraRoutes.get('/pulseira/:id', (req, res) => pulseiraController.selecionar(req, res));
PulseiraRoutes.get('/pulseira/:id/leituras', (req, res) => pulseiraController.leituras(req, res));
PulseiraRoutes.get('/pulseira/:id/status', (req, res) => pulseiraController.status(req, res));

// Restrito a cuidador
// POST /pulseira: o middleware gera o token, depois o controller cria e vincula
PulseiraRoutes.post('/pulseira', requireCuidador, gerarDeviceTokenMiddleware, (req, res) => pulseiraController.criar(req, res));
PulseiraRoutes.put('/pulseira/:id', requireCuidador, (req, res) => pulseiraController.editar(req, res));
PulseiraRoutes.delete('/pulseira/:id', requireCuidador, (req, res) => pulseiraController.deletar(req, res));
PulseiraRoutes.patch('/pulseira/:id/intervalo', requireCuidador, (req, res) => pulseiraController.atualizarIntervalo(req, res));

export default PulseiraRoutes;