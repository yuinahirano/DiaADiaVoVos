import { Router } from "express";
import usuarioRoutes from "./usuario.routes";
import cuidadorRoutes from "./cuiador.routes";

const router = Router();

router.use('/', usuarioRoutes);
router.use('/', idosoRoutes);
router.use('/', cuidadorRoutes);

export default router;