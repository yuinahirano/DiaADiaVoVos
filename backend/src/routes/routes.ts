import { Router } from "express";
import usuarioRoutes from "./usuario.routes";
import cuidadorRoutes from "./cuiador.routes";
import idosoRoutes from "./idoso.routes";
import idosoCuidadorRoutes from "./idosoCuidador.routes";
import consultaRoutes from "./consulta.routes";
import DoencaRoutes from "./doenca.routes";
import medicamentoRoutes from "./medicamento.routes";
import receitaRoutes from "./receitaMedica.routes";
import enderecoRoutes from "./endereco.routes";
import adminRoutes from "./admin.routes";

const router = Router();

router.use('/', usuarioRoutes);
router.use('/', idosoRoutes);
router.use('/', cuidadorRoutes);
router.use('/', idosoCuidadorRoutes);
router.use('/', consultaRoutes);
router.use('/', DoencaRoutes);
router.use('/', medicamentoRoutes);
router.use('/', receitaRoutes);
router.use('/', enderecoRoutes);
router.use('/', adminRoutes);

export default router;
