import { Router } from "express";
import usuarioRoutes from "./usuario.routes";
import cuidadorRoutes from "./cuiador.routes";
import idosoRoutes from "./idoso.routes";
import idosoCuidadorRoutes from "./idosoCuidador.routes";

const router = Router();

router.use('/', usuarioRoutes);
router.use('/', idosoRoutes);
router.use('/', cuidadorRoutes);
router.use('/', idosoCuidadorRoutes);

export default router;