import { Router } from "express";
import { SolicitacaoCuidadorController } from "../controller/solicitacaoRelacionamento.controller";
import { autenticarToken } from "../middlewares/jwt.middlewares";

const solicitacaoCuidadorController = new SolicitacaoCuidadorController();
const solicitacaoCuidadorRoutes = Router();

solicitacaoCuidadorRoutes.get("/solicitacoesCuidador", autenticarToken, solicitacaoCuidadorController.selecionarTodos);
solicitacaoCuidadorRoutes.get("/solicitacaoCuidador/:id", autenticarToken, solicitacaoCuidadorController.selecionarPorId);
solicitacaoCuidadorRoutes.get("/solicitacaoCuidador/idoso/:idIdoso", autenticarToken, solicitacaoCuidadorController.selecionarPorIdoso);
solicitacaoCuidadorRoutes.get("/solicitacaoCuidador/cuidador/:idCuidador", autenticarToken, solicitacaoCuidadorController.selecionarPorCuidador);

solicitacaoCuidadorRoutes.post("/solicitacaoCuidador", autenticarToken, solicitacaoCuidadorController.criar);
solicitacaoCuidadorRoutes.put("/solicitacaoCuidador/:id", autenticarToken, solicitacaoCuidadorController.editar);
solicitacaoCuidadorRoutes.delete("/solicitacaoCuidador/:id", autenticarToken, solicitacaoCuidadorController.deletar);

solicitacaoCuidadorRoutes.patch("/solicitacaoCuidador/:id/aceitar", autenticarToken, solicitacaoCuidadorController.aceitar);
solicitacaoCuidadorRoutes.patch("/solicitacaoCuidador/:id/recusar", autenticarToken, solicitacaoCuidadorController.recusar);
solicitacaoCuidadorRoutes.patch("/solicitacaoCuidador/:id/cancelar", autenticarToken, solicitacaoCuidadorController.cancelar);

solicitacaoCuidadorRoutes.delete("/solicitacaoCuidador/idoso/limpar/:idIdoso", autenticarToken, solicitacaoCuidadorController.deletarPorIdoso);

export default solicitacaoCuidadorRoutes;