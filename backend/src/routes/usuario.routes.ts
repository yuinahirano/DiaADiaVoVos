<<<<<<< HEAD
// usuario.routes.ts
=======
>>>>>>> 6267fb6640d639d94f17324c76df5f279f3f574f
import { Router } from "express";
import { UsuarioController } from "../controller/usuario.controller";
import { autenticarToken } from "../middlewares/jwt.middlewares";

const usuarioController = new UsuarioController();
const usuarioRoutes = Router();

usuarioRoutes.get("/usuarios", usuarioController.selecionar);
usuarioRoutes.get("/usuarios/:id", usuarioController.selecionar);
usuarioRoutes.post("/usuarios", usuarioController.criar);
usuarioRoutes.put("/usuarios/:id", autenticarToken, usuarioController.editar);
usuarioRoutes.delete("/usuarios/:id", autenticarToken, usuarioController.deletar);
usuarioRoutes.post("/usuarios/login", usuarioController.login);

export default usuarioRoutes;