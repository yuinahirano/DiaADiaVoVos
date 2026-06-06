import { Router } from "express";
import uploadImage from "../middlewares/uploadImage.middlewares";
import {UsuarioController } from "../controller/usuario.controller";
import { autenticarToken } from "../middlewares/jwt.middlewares";
const usuarioController = new UsuarioController();
const usuarioRoutes = Router();

usuarioRoutes.get('/usuarios', usuarioController.selecionar);
usuarioRoutes.get('/usuarios/:id', usuarioController.selecionar);
usuarioRoutes.get('/usuarios/email', usuarioController.selecionar);
usuarioRoutes.post('/usuarios', usuarioController.criar);
usuarioRoutes.put('/usuarios/:id', usuarioController.editar);
// usuarioRoutes.delete('/usuarios/:id', usuarioController.deletar);
usuarioRoutes.post('/usuarios/login', usuarioController.login);
usuarioRoutes.delete('/usuarios/:id', autenticarToken, usuarioController.deletar);
    
export default usuarioRoutes;