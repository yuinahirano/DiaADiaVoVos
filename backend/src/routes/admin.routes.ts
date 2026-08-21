import { Router } from "express";
import { AdminController } from "../controller/admin.controller";
import { autenticarToken } from "../middlewares/jwt.middlewares";

const admin = new AdminController();
const adminRoutes = Router();

adminRoutes.get("/admin", admin.selecionar);
adminRoutes.get("/admin/:id", admin.selecionar);
adminRoutes.post("/admin", admin.criar);
adminRoutes.put("/admin/:id", autenticarToken, admin.editar);
adminRoutes.delete("/admin/:id", autenticarToken, admin.deletar);
adminRoutes.post("/admin/login", admin.login);

export default adminRoutes;