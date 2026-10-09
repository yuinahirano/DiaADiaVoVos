import { Router } from "express";
import { LeituraController } from "../controller/leitura.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";
import { requireCuidador } from "../middlewares/role.middlewares";
import { deviceAuthMiddleware } from "../middlewares/device.middlewares";

const LeituraRoutes = Router();
const leituraController = new LeituraController();

// Rota do ESP32 (Wi-Fi): autenticada pelo token do dispositivo.
// Precisa vir ANTES do authMiddleware abaixo, senão seria bloqueada.
LeituraRoutes.post('/leitura/dispositivo', deviceAuthMiddleware, (req, res) => leituraController.criarDoDispositivo(req, res));

// Autenticação obrigatória nas demais rotas
LeituraRoutes.use(authMiddleware);

// Usa arrow function em vez de passar o método direto (ex: leituraController.selecionar)
// porque o Express chama a função sem o objeto original, perdendo o "this";
// a arrow function garante que o método sempre execute com o "this" correto
LeituraRoutes.get('/leitura', (req, res) => leituraController.selecionar(req, res));
LeituraRoutes.get('/leitura/:id', (req, res) => leituraController.selecionar(req, res));

// authMiddleware (acima) valida o JWT do usuário; o deviceAuthMiddleware
// descobre a pulseira pelo header x-device-token.
LeituraRoutes.post('/leitura/lote', deviceAuthMiddleware, (req, res) => leituraController.criarLote(req, res));

// Restrito a cuidador
LeituraRoutes.post('/leitura', requireCuidador, (req, res) => leituraController.criar(req, res));
LeituraRoutes.put('/leitura/:id', requireCuidador, (req, res) => leituraController.editar(req, res));
LeituraRoutes.delete('/leitura/:id', requireCuidador, (req, res) => leituraController.deletar(req, res));

export default LeituraRoutes;