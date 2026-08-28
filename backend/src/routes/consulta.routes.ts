import { Router } from "express";
import { ConsultaController } from "../controller/consulta.controller";
<<<<<<< HEAD
const consultaRoutes = Router();

const consultaController = new (ConsultaController);

consultaRoutes.get('/consulta', consultaController.selecionar);
consultaRoutes.get('/consulta/:id', consultaController.selecionar);
consultaRoutes.post('/consulta', consultaController.criar);
consultaRoutes.put('/consulta/:id', consultaController.editar);
consultaRoutes.delete('/consulta/:id',consultaController.deletar);
    
=======
import { authMiddleware } from "../middlewares/auth.middlewares";
import { requireCuidador } from "../middlewares/role.middlewares";

const consultaRoutes = Router();
const consultaController = new ConsultaController();

// Autenticação obrigatória em todas as rotas
consultaRoutes.use(authMiddleware);

// Usa arrow function em vez de passar o método direto (ex: consultaController.selecionar)
// porque o Express chama a função sem o objeto original, perdendo o "this";
// a arrow function garante que o método sempre execute com o "this" correto
consultaRoutes.get('/consulta', (req, res) => consultaController.selecionar(req, res));
consultaRoutes.get('/consulta/:id', (req, res) => consultaController.selecionar(req, res));

// Restrito a cuidador
consultaRoutes.post('/consulta', requireCuidador, (req, res) => consultaController.criar(req, res));
consultaRoutes.put('/consulta/:id', requireCuidador, (req, res) => consultaController.editar(req, res));
consultaRoutes.delete('/consulta/:id', requireCuidador, (req, res) => consultaController.deletar(req, res));

>>>>>>> 6267fb6640d639d94f17324c76df5f279f3f574f
export default consultaRoutes;