import { Router } from "express";
import { EnderecoController } from "../controller/endereco.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";
import { requireCuidador } from "../middlewares/role.middlewares";

const enderecoRoutes = Router();
const enderecoController = new EnderecoController();

enderecoRoutes.use(authMiddleware);

enderecoRoutes.get("/enderecos", (req, res) => enderecoController.selecionar(req, res));

enderecoRoutes.get("/enderecos/usuario/:idUsuario", (req, res) => enderecoController.selecionarPorUsuario(req, res));

enderecoRoutes.get("/enderecos/:id", (req, res) => enderecoController.selecionar(req, res));

enderecoRoutes.post("/enderecos", requireCuidador, (req, res) => enderecoController.criar(req, res));
enderecoRoutes.put("/enderecos/:id", requireCuidador, (req, res) => enderecoController.editar(req, res));
enderecoRoutes.delete("/enderecos/:id", requireCuidador, (req, res) => enderecoController.deletar(req, res));

export default enderecoRoutes;