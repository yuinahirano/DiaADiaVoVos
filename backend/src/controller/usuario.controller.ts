import { Request, Response } from "express";
import { UsuarioService } from "../services/usuario.services";

export class UsuarioController {
  constructor(private _service = new UsuarioService()) {}

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

selecionarPorToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const result = await this._service.selecionarPorToken(token);
    return res.status(200).json({ result });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return res.status(500).json({ message: "Ocorreu um erro no servidor", errorMessage: message });
  }
};

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

  criar = async (req: Request, res: Response) => {
    try {
      const { nome, cpf, email, senha, dataNascimento, estadoCivil } = req.body;
      const novo = await this._service.criar(nome, cpf, email, senha, dataNascimento, estadoCivil);
      res.status(201).json({ novo });
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({ message: "Ocorreu um erro no servidor", errorMessage: message });
    }
  };

  editar = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const { nome, cpf, email, senha, dataNascimento, estadoCivil } = req.body;
      const editado = await this._service.editar(id, nome, cpf, email, senha, dataNascimento, estadoCivil);
      res.status(200).json({ editado });
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
      res.status(200).json({ deletado });
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({ message: "Ocorreu um erro no servidor", errorMessage: message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, senha } = req.body;
      const login = await this._service.login(email, senha);
      res.status(200).json({ login });
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({ message: "Ocorreu um erro no servidor", errorMessage: message });
    }
  };
}