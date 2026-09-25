import { Request, Response } from "express";
import { ConsultaService } from "../services/consulta.services";

export class ConsultaController {
  constructor(private _service = new ConsultaService()) {}
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
      const { nomeMedico, horario, localConsulta, idIdoso, data } = req.body;
      const novo = await this._service.criar(
        nomeMedico,
        horario,
        localConsulta,
        idIdoso,
        data,
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
      const { nomeMedico, horario, localConsulta, idIdoso, data } = req.body;
      const editado = await this._service.editar(
        nomeMedico,
        horario,
        localConsulta,
        idIdoso,
        data,
        id,
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

Compareceu = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const atualizado = await this._service.Compareceu(id);
    res.status(200).json({ atualizado });
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