import { Router } from "express";
import usuarioRoutes from "./usuario.routes";
import idosoRoutes from "./idoso.routes";

const router = Router();

router.use('/', usuarioRoutes);
router.use('/', idosoRoutes);

export default router;