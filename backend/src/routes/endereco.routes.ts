import { Router } from "express";
import { EnderecoController } from "../controller/endereco.controller";
import { autenticarToken } from "../middlewares/jwt.middlewares";

const enderecoController = new EnderecoController();
const enderecoRoutes = Router();

enderecoRoutes.get("/enderecos", enderecoController.selecionar);
enderecoRoutes.get("/enderecos/:id", enderecoController.selecionar);
enderecoRoutes.post("/enderecos", autenticarToken, enderecoController.criar);
enderecoRoutes.put("/enderecos/:id", autenticarToken, enderecoController.editar);
enderecoRoutes.delete("/enderecos/:id", autenticarToken, enderecoController.deletar);

export default enderecoRoutes;