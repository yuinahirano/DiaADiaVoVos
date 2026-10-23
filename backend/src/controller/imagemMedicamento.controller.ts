import { Request, Response } from 'express';
import { ImagemMedicamentoService } from '../services/imagemMedicamento.services';

const getParam = (p: string | string[]): string => Array.isArray(p) ? p[0] : p;

export class ImagemMedicamentoController {
  constructor(private _service = new ImagemMedicamentoService()) {}

  criar = async (req: Request, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'Imagem não enviada' });
      const id = getParam(req.params.id);
      await this._service.criar(id, req.file);
      return res.status(201).json({ message: 'Imagem salva com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      return res.status(500).json({ message: 'Erro no servidor', errorMessage: message });
    }
  };

  buscar = async (req: Request, res: Response) => {
    try {
      const id = getParam(req.params.id);
      const imagem = await this._service.buscar(id);
      const buffer = Buffer.from(imagem.base64, 'base64');
      res.set('Content-Type', imagem.mimetype);
      return res.send(buffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      return res.status(404).json({ message: 'Imagem não encontrada', errorMessage: message });
    }
  };

  editar = async (req: Request, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'Imagem não enviada' });
      const id = getParam(req.params.id);
      await this._service.editar(id, req.file);
      return res.status(200).json({ message: 'Imagem atualizada com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      return res.status(500).json({ message: 'Erro no servidor', errorMessage: message });
    }
  };

  deletar = async (req: Request, res: Response) => {
    try {
      const id = getParam(req.params.id);
      await this._service.deletar(id);
      return res.status(200).json({ message: 'Imagem deletada com sucesso' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      return res.status(500).json({ message: 'Erro no servidor', errorMessage: message });
    }
  };
}