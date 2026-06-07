import { Router } from "express";
import usuarioRoutes from "./usuario.routes";
import enderecoRoutes from "./endereco.routes";


const router = Router();

router.use('/', usuarioRoutes);
router.use('/', enderecoRoutes);

export default router;