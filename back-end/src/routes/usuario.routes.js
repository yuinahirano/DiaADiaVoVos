import { Router } from "express";
import usuarioController from "../controllers/usuarioController.js";

const usuarioRoutes = Router();

usuarioRoutes.post('/', usuarioController.criar);
usuarioRoutes.put('/:id', usuarioController.alterar);
usuarioRoutes.delete('/:id', usuarioController.deletar);
usuarioRoutes.get('/', usuarioController.selecionar);


export default usuarioRoutes;