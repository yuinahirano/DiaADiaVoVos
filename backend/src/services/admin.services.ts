import { AdminRepository } from "../repository/admin.repository";
import { Admin } from "../models/admin.model";
import { hashSenha, compararSenha } from "../config/bcrypt.config";
import jwt from "jsonwebtoken";

export class AdminService {
  constructor(private _repository = new AdminRepository()) {}

  async selecionarTodos() {
    return await this._repository.selecionarTodos();
  }

  async selecionarPorId(id: string) {
    return await this._repository.selecionarPorId(id);
  }

  async criar(
    nome: string,
    email: string,
    senha: string,
  ) {
    const admin = Admin.criar(nome, email, senha);

    const senhaHash = await hashSenha(senha);
    admin.Senha = senhaHash;

    const resultado = await this._repository.criar({
      nome: admin.Nome,
      email: admin.Email,
      senha: admin.Senha,
    });

    const token = jwt.sign(
      { id: resultado.insertId, email: admin.Email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    return { token };
  }

  async editar(
    id: string,
    nome: string,
    email: string,
    senha: string,
  ) {
    const adminExistente = await this._repository.selecionarPorId(id);
    if (adminExistente.length === 0)
      throw new Error("Admin não encontrado");

    const admin = Admin.editar(nome, email, senha, id);

    const senhaHash = await hashSenha(senha);
    admin.Senha = senhaHash;

    return await this._repository.editar(id, {
      nome: admin.Nome,
      email: admin.Email,
      senha: admin.Senha,
    });
  }

  async deletar(id: string) {
    const adminExistente = await this._repository.selecionarPorId(id);
    if (adminExistente.length === 0)
      throw new Error("Admin não encontrado");

    return await this._repository.deletar(id);
  }

  async login(email: string, senha: string) {
    const [admin] = await this._repository.selecionarPorEmail(email);
    if (!admin)
      throw new Error("Email ou senha inválidos");

    const senhaValida = await compararSenha(senha, admin.senha);
    if (!senhaValida)
      throw new Error("Email ou senha inválidos");

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "999h" }
    );

    return { token };
  }
}