import { Router } from "express";
import usuarioRoutes from "./usuario.routes";
import idosoRoutes from "./idoso.routes";
import cuidadorRoutes from "./cuiador.routes";
import idosoCuidadorRoutes from "./idosoCuidador.routes";
import DoencaRoutes from "./doenca.routes";
import consultaRoutes from "./consulta.routes";
import receitaRoutes from "./receitaMedica.routes";

const router = Router();

router.use('/', usuarioRoutes);
router.use('/', idosoRoutes);
router.use('/', cuidadorRoutes);
router.use('/', idosoCuidadorRoutes);
router.use('/', DoencaRoutes);
router.use('/', consultaRoutes);
router.use('/', receitaRoutes);

export default router;