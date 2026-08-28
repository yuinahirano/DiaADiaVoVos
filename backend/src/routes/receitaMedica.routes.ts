import { Router } from "express";
import { ReceitaMedicaController } from "../controller/receitaMedica.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";
import { requireCuidador } from "../middlewares/role.middlewares";

const receitaRoutes = Router();
const receitaController = new ReceitaMedicaController();

// Autenticação obrigatória em todas as rotas
receitaRoutes.use(authMiddleware);

// Usa arrow function em vez de passar o método direto (ex: receitaController.selecionar)
// porque o Express chama a função sem o objeto original, perdendo o "this";
// a arrow function garante que o método sempre execute com o "this" correto
receitaRoutes.get('/receita', (req, res) => receitaController.selecionar(req, res));
receitaRoutes.get('/receita/:id', (req, res) => receitaController.selecionar(req, res));

// Restrito a cuidador
receitaRoutes.post('/receita', requireCuidador, (req, res) => receitaController.criar(req, res));
receitaRoutes.put('/receita/:id', requireCuidador, (req, res) => receitaController.editar(req, res));
receitaRoutes.delete('/receita/:id', requireCuidador, (req, res) => receitaController.deletar(req, res));

export default receitaRoutes;