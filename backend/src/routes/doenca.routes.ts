import { Router } from "express";
import { DoencaController } from "../controller/doenca.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";
import { requireCuidador } from "../middlewares/role.middlewares";

const DoencaRoutes = Router();
const doencaController = new DoencaController();

// Autenticação obrigatória em todas as rotas
DoencaRoutes.use(authMiddleware);

// Usa arrow function em vez de passar o método direto (ex: doencaController.selecionar)
// porque o Express chama a função sem o objeto original, perdendo o "this";
// a arrow function garante que o método sempre execute com o "this" correto
DoencaRoutes.get('/doenca', (req, res) => doencaController.selecionar(req, res));
DoencaRoutes.get('/doenca/:id', (req, res) => doencaController.selecionar(req, res));

// Restrito a cuidador
DoencaRoutes.post('/doenca', requireCuidador, (req, res) => doencaController.criar(req, res));
DoencaRoutes.put('/doenca/:id', requireCuidador, (req, res) => doencaController.editar(req, res));
DoencaRoutes.delete('/doenca/:id', requireCuidador, (req, res) => doencaController.deletar(req, res));

export default DoencaRoutes;