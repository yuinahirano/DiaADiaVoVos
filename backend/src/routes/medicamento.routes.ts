import { Router } from "express";
import { MedicamentoController } from "../controller/medicamento.controller";
<<<<<<< HEAD
const medicamentoRoutes = Router();

const medicamentoController = new (MedicamentoController);

medicamentoRoutes.get('/medicamento', medicamentoController.selecionar);
medicamentoRoutes.get('/medicamento/:id', medicamentoController.selecionar);
medicamentoRoutes.post('/medicamento', medicamentoController.criar);
medicamentoRoutes.put('/medicamento/:id', medicamentoController.editar);
medicamentoRoutes.delete('/medicamento/:id',medicamentoController.deletar);
    
=======
import { authMiddleware } from "../middlewares/auth.middlewares";
import { requireCuidador } from "../middlewares/role.middlewares";

const medicamentoRoutes = Router();
const medicamentoController = new MedicamentoController();

// Autenticação obrigatória em todas as rotas
medicamentoRoutes.use(authMiddleware);

// Usa arrow function em vez de passar o método direto (ex: medicamentoController.selecionar)
// porque o Express chama a função sem o objeto original, perdendo o "this";
// a arrow function garante que o método sempre execute com o "this" correto
medicamentoRoutes.get('/medicamento', (req, res) => medicamentoController.selecionar(req, res));
medicamentoRoutes.get('/medicamento/idosos/:idIdoso', (req, res) => medicamentoController.selecionarPorIdoso(req, res));
medicamentoRoutes.get('/medicamento/:id', (req, res) => medicamentoController.selecionar(req, res));

// Restrito a cuidador
medicamentoRoutes.post('/medicamento', requireCuidador, (req, res) => medicamentoController.criar(req, res));
medicamentoRoutes.put('/medicamento/:id', requireCuidador, (req, res) => medicamentoController.editar(req, res));
medicamentoRoutes.delete('/medicamento/:id', requireCuidador, (req, res) => medicamentoController.deletar(req, res));

>>>>>>> 6267fb6640d639d94f17324c76df5f279f3f574f
export default medicamentoRoutes;