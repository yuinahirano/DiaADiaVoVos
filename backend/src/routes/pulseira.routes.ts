import { Router } from "express";
import { PulseiraController } from "../controller/pulseira.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";
import { requireCuidador } from "../middlewares/role.middlewares";
import { gerarDeviceTokenMiddleware } from "../middlewares/device.middlewares";

const PulseiraRoutes = Router();
const pulseiraController = new PulseiraController();

PulseiraRoutes.use(authMiddleware);

PulseiraRoutes.get('/pulseira', (req, res) => pulseiraController.selecionar(req, res));

PulseiraRoutes.get('/pulseira/usuario/:idUsuario', (req, res) => pulseiraController.selecionarPorUsuario(req, res));

PulseiraRoutes.get('/pulseira/:id', (req, res) => pulseiraController.selecionar(req, res));
PulseiraRoutes.get('/pulseira/:id/leituras', (req, res) => pulseiraController.leituras(req, res));
PulseiraRoutes.get('/pulseira/:id/status', (req, res) => pulseiraController.status(req, res));

PulseiraRoutes.post('/pulseira', requireCuidador, gerarDeviceTokenMiddleware, (req, res) => pulseiraController.criar(req, res));
PulseiraRoutes.put('/pulseira/:id', requireCuidador, (req, res) => pulseiraController.editar(req, res));
PulseiraRoutes.delete('/pulseira/:id', requireCuidador, (req, res) => pulseiraController.deletar(req, res));
PulseiraRoutes.patch('/pulseira/:id/intervalo', requireCuidador, (req, res) => pulseiraController.atualizarIntervalo(req, res));

export default PulseiraRoutes;