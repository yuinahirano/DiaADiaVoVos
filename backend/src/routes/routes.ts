import { Router } from "express";
import usuarioRoutes from "./usuario.routes";
<<<<<<< HEAD
import idosoRoutes from "./idoso.routes";
import cuidadorRoutes from "./cuiador.routes";
import idosoCuidadorRoutes from "./idosoCuidador.routes";
import DoencaRoutes from "./doenca.routes";
import consultaRoutes from "./consulta.routes";
import receitaRoutes from "./receitaMedica.routes";
import medicamentoRoutes from "./medicamento.routes";
import enderecoRoutes from "./endereco.routes";

=======
import cuidadorRoutes from "./cuiador.routes";
import idosoRoutes from "./idoso.routes";
import idosoCuidadorRoutes from "./idosoCuidador.routes";
import consultaRoutes from "./consulta.routes";
import DoencaRoutes from "./doenca.routes";
import medicamentoRoutes from "./medicamento.routes";
import receitaRoutes from "./receitaMedica.routes";
import enderecoRoutes from "./endereco.routes";
import adminRoutes from "./admin.routes";
>>>>>>> 6267fb6640d639d94f17324c76df5f279f3f574f

const router = Router();

router.use('/', usuarioRoutes);
router.use('/', idosoRoutes);
router.use('/', cuidadorRoutes);
router.use('/', idosoCuidadorRoutes);
<<<<<<< HEAD
router.use('/', DoencaRoutes);
router.use('/', consultaRoutes);
router.use('/', receitaRoutes);
router.use('/', medicamentoRoutes);
router.use('/', enderecoRoutes);

export default router;
=======
router.use('/', consultaRoutes);
router.use('/', DoencaRoutes);
router.use('/', medicamentoRoutes);
router.use('/', receitaRoutes);
router.use('/', enderecoRoutes);
router.use('/', adminRoutes);

export default router;
>>>>>>> 6267fb6640d639d94f17324c76df5f279f3f574f
