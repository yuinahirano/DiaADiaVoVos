import { Router } from "express";
import { SolicitacaoPulseiraController } from "../controller/solicitacaoPulseira.controller";
import { autenticarToken } from "../middlewares/jwt.middlewares";
import { gerarDeviceTokenMiddleware } from "../middlewares/device.middlewares"; // ADAPTAR: arquivo onde está o deviceAuthMiddleware

const solicitacaoPulseiraController = new SolicitacaoPulseiraController();
const solicitacaoPulseiraRoutes = Router();

solicitacaoPulseiraRoutes.get("/solicitacoesPulseira", autenticarToken, solicitacaoPulseiraController.selecionarTodos);
solicitacaoPulseiraRoutes.get("/solicitacaoPulseira/:id", autenticarToken, solicitacaoPulseiraController.selecionarPorId);
solicitacaoPulseiraRoutes.get("/solicitacaoPulseira/idoso/:idIdoso", autenticarToken, solicitacaoPulseiraController.selecionarPorIdoso);
solicitacaoPulseiraRoutes.get("/solicitacaoPulseira/cuidador/:idCuidador", autenticarToken, solicitacaoPulseiraController.selecionarPorCuidador);

solicitacaoPulseiraRoutes.post("/solicitacaoPulseira", autenticarToken, solicitacaoPulseiraController.criar);
solicitacaoPulseiraRoutes.put("/solicitacaoPulseira/:id", autenticarToken, solicitacaoPulseiraController.editar);
solicitacaoPulseiraRoutes.delete("/solicitacaoPulseira/:id", autenticarToken, solicitacaoPulseiraController.deletar);

// aceitar: o middleware gera o token, o service muda o status e roda o criar da pulseira
solicitacaoPulseiraRoutes.patch("/solicitacaoPulseira/:id/aceitar", autenticarToken, gerarDeviceTokenMiddleware, solicitacaoPulseiraController.aceitar);
solicitacaoPulseiraRoutes.patch("/solicitacaoPulseira/:id/recusar", autenticarToken, solicitacaoPulseiraController.recusar);
solicitacaoPulseiraRoutes.patch("/solicitacaoPulseira/:id/cancelar", autenticarToken, solicitacaoPulseiraController.cancelar);

solicitacaoPulseiraRoutes.delete("/solicitacaoPulseira/idoso/limpar/:idIdoso", autenticarToken, solicitacaoPulseiraController.deletarPorIdoso);

export default solicitacaoPulseiraRoutes;