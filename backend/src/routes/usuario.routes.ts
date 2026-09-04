import { Router } from "express";
import { UsuarioController } from "../controller/usuario.controller";
import { autenticarToken } from "../middlewares/jwt.middlewares";

const usuarioController = new UsuarioController();
const usuarioRoutes = Router();

usuarioRoutes.get("/usuarios", usuarioController.selecionarTodos);
usuarioRoutes.get("/usuario/me", usuarioController.selecionarPorToken);
usuarioRoutes.get("/usuario/:id", usuarioController.selecionarPorId);
usuarioRoutes.post("/usuario", usuarioController.criar);
usuarioRoutes.put("/usuario/:id", autenticarToken, usuarioController.editar);
usuarioRoutes.delete("/usuario/:id", autenticarToken, usuarioController.deletar);
usuarioRoutes.post("/usuario/login", usuarioController.login);
export default usuarioRoutes;