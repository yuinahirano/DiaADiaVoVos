import { Router } from "express";
import usuarioRoutes from "./usuario.routes";
import cuidadorRoutes from "./cuiador.routes";
import idosoRoutes from "./idoso.routes";
import idosoCuidadorRoutes from "./idosoCuidador.routes";
import consultaRoutes from "./consulta.routes";

const router = Router();

router.use('/', usuarioRoutes);
router.use('/', idosoRoutes);
router.use('/', cuidadorRoutes);
router.use('/', idosoCuidadorRoutes);
router.use('/', consultaRoutes);

export default router;