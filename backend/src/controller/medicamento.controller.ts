import { Request, Response } from "express";
import { MedicamentoService } from "../services/medicamento.services";

export class MedicamentoController {
  constructor(private _service = new ( MedicamentoService )) {}
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

  selecionarPorIdoso = async (req: Request, res: Response) => {
    try {
      const idIdoso = String(req.params.idIdoso);
      const result = await this._service.selecionarPorIdIdoso(idIdoso);
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

  selecionarPendentes = async (req: Request, res: Response) => {
    try {
      const result = await this._service.selecionarPendentes();
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
      const {
        nome,
        dosagem,
        horario,
        tipoFrequencia,
        valorFrequencia,
        observacoes,
        idIdoso,
      } = req.body;
      const novo = await this._service.criar(
        nome,
        dosagem,
        horario,
        tipoFrequencia,
        Number(valorFrequencia),
        idIdoso,
        observacoes
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
      const {
        nome,
        dosagem,
        horario,
        tipoFrequencia,
        valorFrequencia,
        status,
        observacoes,
        idIdoso,
      } = req.body;
      const editado = await this._service.editar(
        nome,
        dosagem,
        horario,
        tipoFrequencia,
        Number(valorFrequencia),
        idIdoso,
        status,
        observacoes,
        id
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

  registrarDose = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const result = await this._service.registrarDose(id);
      res.status(200).json({ result });
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