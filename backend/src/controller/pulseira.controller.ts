import { Request, Response } from "express";
import { PulseiraService } from "../services/pulseira.services";
import { ErroValidacao } from "../models/pulseira.model";

export class PulseiraController {
  constructor(private _service = new PulseiraService()) {}

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

  // NOVO: GET /pulseira/usuario/:idUsuario
  // O app lê o id de dentro do token e pede só as pulseiras desse usuário
  selecionarPorUsuario = async (req: Request, res: Response) => {
    try {
      const idUsuario = String(req.params.idUsuario);
      const result = await this._service.selecionarPorUsuario(idUsuario);
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

  // UNIFICADO (criar + vincular): o token vem do middleware (req.deviceToken)
  criar = async (req: Request, res: Response) => {
    try {
      // intervaloLeituraSeg é opcional: sem ele vale o padrão (600 s)
      const { idIdoso, idCuidador, nome, intervaloLeituraSeg } = req.body;
      const deviceToken: string = (req as any).deviceToken;
      const novo = await this._service.criar(
        idIdoso,
        idCuidador,
        nome,
        deviceToken,
        intervaloLeituraSeg,
      );
      res.status(201).json({ novo });
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof ErroValidacao)
        return res.status(400).json({ message: error.message });
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
      const { idIdoso, idCuidador, nome } = req.body;
      const editado = await this._service.editar(
        id,
        idIdoso,
        idCuidador,
        nome,
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

  // PATCH /pulseira/:id/intervalo  body: { "intervaloLeituraSeg": 600 }
  atualizarIntervalo = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const { intervaloLeituraSeg } = req.body;
      const result = await this._service.atualizarIntervalo(
        id,
        intervaloLeituraSeg,
      );
      return res.status(200).json(result);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof ErroValidacao)
        return res.status(400).json({ message: error.message });
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({
        message: "Ocorreu um erro no servidor",
        errorMessage: message,
      });
    }
  };

  // NOVO: GET /pulseira/:id/leituras
  leituras = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const result = await this._service.selecionarLeituras(id);
      return res.status(200).json({ result });
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

  status = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const result = await this._service.status(id);
      return res.status(200).json(result);
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