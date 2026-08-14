import { Request, Response } from "express";
import { ReceitaMedicaService } from "../services/receitaMedica.services";

export class ReceitaMedicaController {
  constructor(private _service = new ( ReceitaMedicaService )) {}
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
      return res.status(500).json({
        message: "Ocorreu um erro no servidor",
        errorMessage: message,
      });
    }
  };

  criar = async (req: Request, res: Response) => {
    try {
      const { descricao, data_emissao, data_vencimento, _idConsulta } = req.body;
      const novo = await this._service.criar(
        descricao, data_emissao, data_vencimento, _idConsulta
      );
      res.status(201).json({ novo });
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({
        message: "Ocorreu um erro no servidor",
        errorMessage: message,
      });
    }
  };

  editar = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const { descricao, data_emissao, data_vencimento, _idConsulta } = req.body;
      console.log(descricao, data_emissao, data_vencimento, _idConsulta, id);
      const editado = await this._service.editar(
  descricao, data_emissao, data_vencimento, _idConsulta, id
);
      
      res.status(200).json({ editado });
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({
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
      return res.status(500).json({
        message: "Ocorreu um erro no servidor",
        errorMessage: message,
      });
    }
  };
}
