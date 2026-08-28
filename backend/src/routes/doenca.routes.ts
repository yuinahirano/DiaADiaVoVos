import { Router } from "express";
<<<<<<< HEAD
import {  DoencaController } from "../controller/doenca.controller";
const DoencaRoutes = Router();

const doencaController = new DoencaController();

DoencaRoutes.get('/doenca', doencaController.selecionar);
DoencaRoutes.get('/doenca/:id', doencaController.selecionar);
DoencaRoutes.post('/doenca', doencaController.criar);
DoencaRoutes.put('/doenca/:id', doencaController.editar);
DoencaRoutes.delete('/doenca/:id',doencaController.deletar);
=======
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
>>>>>>> 6267fb6640d639d94f17324c76df5f279f3f574f

export default DoencaRoutes;