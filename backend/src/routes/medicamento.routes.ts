import { Router } from "express";
import { MedicamentoController } from "../controller/medicamento.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";
import { requireCuidador } from "../middlewares/role.middlewares";

const medicamentoRoutes = Router();
const medicamentoController = new MedicamentoController();

// GET livre
medicamentoRoutes.get("/medicamento", (req, res) => medicamentoController.selecionar(req, res));
medicamentoRoutes.get("/medicamento/idosos/:idIdoso", (req, res) => medicamentoController.selecionarPorIdoso(req, res));
medicamentoRoutes.get("/medicamento/:id", (req, res) => medicamentoController.selecionar(req, res));

// POST/PUT/DELETE protegidos
medicamentoRoutes.post("/medicamento", authMiddleware, requireCuidador, (req, res) => medicamentoController.criar(req, res));
medicamentoRoutes.put("/medicamento/:id", authMiddleware, requireCuidador, (req, res) => medicamentoController.editar(req, res));
medicamentoRoutes.delete("/medicamento/:id", authMiddleware, requireCuidador, (req, res) => medicamentoController.deletar(req, res));

export default medicamentoRoutes;