import { Request, Response } from "express";
import { IdosoService } from "../services/idoso.services";

export class IdosoController {
  constructor(private _service = new IdosoService()) {}
  selecionar = async (req: Request, res: Response) => {
    try {
      const id = req.params.id ? String(req.params.id) : null;
      let result = null;
      if (id) {
        result = await this._service.selecionarPorId(id);
        return res.status(200).json({ result });
      }
      result = await this._service.selecionarTodos();
      return res.status(200).json({ result });
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      return res
        .status(500)
        .json({
          message: "Ocorreu um erro no servidor",
          errorMessage: message,
        });
    }
  };

  criar = async (req: Request, res: Response) => {
    try {
      const { tipoSanguineo, telefone, pcd, idUsuario, idImagem } = req.body;
      const novo = await this._service.criar(
        tipoSanguineo,
        telefone,
        pcd,
        idUsuario,
        idImagem,
      );
      res.status(201).json({ novo });
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      return res
        .status(500)
        .json({
          message: "Ocorreu um erro no servidor",
          errorMessage: message,
        });
    }
  };

  editar = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const { tipoSanguineo, telefone, pcd, idUsuario, idImagem } = req.body;
      const editado = await this._service.editar(
        id,
        tipoSanguineo,
        telefone,
        pcd,
        idUsuario,
        idImagem,
      );
      res.status(200).json({ editado });
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      return res
        .status(500)
        .json({
          message: "Ocorreu um erro no servidor",
          errorMessage: message,
        });
    }
  };

  deletar = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const deletado = await this._service.deletar(id);
      res.status(200).json({ deletado });
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      return res
        .status(500)
        .json({
          message: "Ocorreu um erro no servidor",
          errorMessage: message,
        });
    }
  };
}