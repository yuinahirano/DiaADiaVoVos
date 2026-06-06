import { Router } from "express";
import uploadImage from "../middlewares/uploadImage.middlewares";
import {UsuarioController } from "../controller/usuario.controller";

const usuarioController = new UsuarioController();
const usuarioRoutes = Router();

usuarioRoutes.get('/usuarios', usuarioController.selecionar);
// usuarioRoutes.post('/usuarios', uploadImage, usuarioController.criar);
// usuarioRoutes.patch('/usuarios', usuarioController.editar);
// usuarioRoutes.delete('/usuarios', usuarioController.deletar);

export default usuarioRoutes;