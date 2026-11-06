import { Router } from 'express';
import multer from 'multer';
import { ImagemMedicamentoController } from '../controller/imagemMedicamento.controller';
import { authMiddleware } from '../middlewares/auth.middlewares';
import { requireCuidador } from '../middlewares/role.middlewares';

const imagemMedicamentoRoutes = Router();
const controller = new ImagemMedicamentoController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_, file, cb) => {
    const permitidos = ['image/jpeg', 'image/png', 'image/webp'];
    permitidos.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Formato inválido. Use jpg, png ou webp'));
  },
});

// :id = id do medicamento no MySQL
imagemMedicamentoRoutes.post('/medicamento/:id/imagem', authMiddleware, requireCuidador, upload.single('imagem'), (req, res) => controller.criar(req, res));
imagemMedicamentoRoutes.get('/medicamento/:id/imagem', (req, res) => controller.buscar(req, res));
imagemMedicamentoRoutes.put('/medicamento/:id/imagem', authMiddleware, requireCuidador, upload.single('imagem'), (req, res) => controller.editar(req, res));
imagemMedicamentoRoutes.delete('/medicamento/:id/imagem', authMiddleware, requireCuidador, (req, res) => controller.deletar(req, res));

export default imagemMedicamentoRoutes;