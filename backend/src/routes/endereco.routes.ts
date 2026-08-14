import { Router } from "express";
import { EnderecoController } from "../controller/endereco.controller";

const enderecoController = new EnderecoController();
const enderecoRoutes = Router();

enderecoRoutes.get("/enderecos", enderecoController.selecionar);
enderecoRoutes.get("/enderecos/:id", enderecoController.selecionar);
enderecoRoutes.post("/enderecos", enderecoController.criar);
enderecoRoutes.put("/enderecos/:id", enderecoController.editar);
enderecoRoutes.delete("/enderecos/:id", enderecoController.deletar);

export default enderecoRoutes;