import { Router } from "express";
import { EnderecoController } from "../controller/endereco.controller";
<<<<<<< HEAD
import { autenticarToken } from "../middlewares/jwt.middlewares";

const enderecoController = new EnderecoController();
const enderecoRoutes = Router();

enderecoRoutes.get("/enderecos", enderecoController.selecionar);
enderecoRoutes.get("/enderecos/:id", enderecoController.selecionar);
enderecoRoutes.post("/enderecos", autenticarToken, enderecoController.criar);
enderecoRoutes.put("/enderecos/:id", autenticarToken, enderecoController.editar);
enderecoRoutes.delete("/enderecos/:id", autenticarToken, enderecoController.deletar);
=======
import { authMiddleware } from "../middlewares/auth.middlewares";
import { requireCuidador } from "../middlewares/role.middlewares";

const enderecoRoutes = Router();
const enderecoController = new EnderecoController();

// Autenticação obrigatória em todas as rotas
enderecoRoutes.use(authMiddleware);

// Usa arrow function em vez de passar o método direto (ex: enderecoController.selecionar)
// porque o Express chama a função sem o objeto original, perdendo o "this";
// a arrow function garante que o método sempre execute com o "this" correto
enderecoRoutes.get("/enderecos", (req, res) => enderecoController.selecionar(req, res));
enderecoRoutes.get("/enderecos/:id", (req, res) => enderecoController.selecionar(req, res));

// Restrito a cuidador
enderecoRoutes.post("/enderecos", requireCuidador, (req, res) => enderecoController.criar(req, res));
enderecoRoutes.put("/enderecos/:id", requireCuidador, (req, res) => enderecoController.editar(req, res));
enderecoRoutes.delete("/enderecos/:id", requireCuidador, (req, res) => enderecoController.deletar(req, res));
>>>>>>> 6267fb6640d639d94f17324c76df5f279f3f574f

export default enderecoRoutes;