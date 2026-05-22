import { Router } from "express";
const routes = Router();
import usuarioRoutes from "./usuario.routes";

routes.use('/usuario', usuarioRoutes);

export default routes;