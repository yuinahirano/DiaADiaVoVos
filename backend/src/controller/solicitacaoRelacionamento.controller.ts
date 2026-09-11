import { Request, Response } from "express";
import { SolicitacaoCuidadorService } from "../services/solicitacaoRelacionamento.services";

export class SolicitacaoCuidadorController {
  constructor(private _service = new SolicitacaoCuidadorService()) {}

  selecionarTodos = async (req: Request, res: Response) => {
    try {
      const result = await this._service.selecionarTodos();
      return res.status(200).json({ result });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({ message: "Ocorreu um erro no servidor", errorMessage: message });
    }
  };

  selecionarPorId = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const result = await this._service.selecionarPorId(id);
      return res.status(200).json({ result });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({ message: "Ocorreu um erro no servidor", errorMessage: message });
    }
  };

  selecionarPorIdoso = async (req: Request, res: Response) => {
    try {
      const idIdoso = String(req.params.idIdoso);
      const result = await this._service.selecionarPorIdoso(idIdoso);
      return res.status(200).json({ result });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({ message: "Ocorreu um erro no servidor", errorMessage: message });
    }
  };

  selecionarPorCuidador = async (req: Request, res: Response) => {
    try {
      const idCuidador = String(req.params.idCuidador);
      const result = await this._service.selecionarPorCuidador(idCuidador);
      return res.status(200).json({ result });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({ message: "Ocorreu um erro no servidor", errorMessage: message });
    }
  };

  criar = async (req: Request, res: Response) => {
    try {
      const { emailIdoso, idCuidador, contatoEmergencia, diasParaExpirar } = req.body;
      const novo = await this._service.criar(emailIdoso, idCuidador, contatoEmergencia, diasParaExpirar);
      return res.status(201).json({ novo });
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({ message: "Ocorreu um erro no servidor", errorMessage: message });
    }
  };

  editar = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const { idIdoso, idCuidador, status, expiraEm, contatoEmergencia } = req.body;
      const editado = await this._service.editar(id, idIdoso, idCuidador, status, expiraEm, contatoEmergencia);
      return res.status(200).json({ editado });
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({ message: "Ocorreu um erro no servidor", errorMessage: message });
    }
  };

  deletar = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const deletado = await this._service.deletar(id);
      return res.status(200).json({ deletado });
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({ message: "Ocorreu um erro no servidor", errorMessage: message });
    }
  };

  aceitar = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const result = await this._service.aceitar(id);
      return res.status(200).json({ result });
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({ message: "Ocorreu um erro no servidor", errorMessage: message });
    }
  };

  recusar = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const result = await this._service.recusar(id);
      return res.status(200).json({ result });
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({ message: "Ocorreu um erro no servidor", errorMessage: message });
    }
  };

  cancelar = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const result = await this._service.cancelar(id);
      return res.status(200).json({ result });
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({ message: "Ocorreu um erro no servidor", errorMessage: message });
    }
  };
}