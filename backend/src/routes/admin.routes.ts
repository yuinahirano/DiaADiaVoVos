import { Router } from "express";
import { AdminController } from "../controller/admin.controller";
import { autenticarToken } from "../middlewares/jwt.middlewares";

const admin = new AdminController();
const adminRoutes = Router();

adminRoutes.get("/admin", autenticarToken, admin.selecionar);
adminRoutes.get("/admin/:id", autenticarToken, admin.selecionar);
adminRoutes.post("/admin", autenticarToken, admin.criar);
adminRoutes.put("/admin/:id", autenticarToken, admin.editar);
adminRoutes.delete("/admin/:id", autenticarToken, admin.deletar);
adminRoutes.post("/admin/login", admin.login);

export default adminRoutes;