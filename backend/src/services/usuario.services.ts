import { UsuarioRepository } from "../repository/usuario.repository";
import { Usuario } from "../models/usuario.model";
import { EstadoCivil } from "../enums/estadoCivil.enums";
import { hashSenha, compararSenha } from "../config/bcrypt.config";
import { CpfUtils } from "../utils/validarCpf.utils";
import jwt from "jsonwebtoken";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export class AppError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class UsuarioService {
  constructor(private _repository = new UsuarioRepository()) {}

  async selecionarTodos() {
    return await this._repository.selecionarTodos();
  }

  async selecionarPorId(id: string) {
    return await this._repository.selecionarPorId(id);
  }

  async selecionarPorEmail(email: string) {
    return await this._repository.selecionarPorEmail(email);
  }

  selecionarPorToken = async (token: string) => {
    let decoded: { id: string };

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    } catch {
      throw new AppError("Token inválido ou expirado", 401);
    }

    return this.selecionarPorId(decoded.id);
  };

  async criar(
    nome: string,
    cpf: string,
    email: string,
    senha: string,
    dataNascimento: string,
    estadoCivil: EstadoCivil
  ) {
    const cpfLimpo = CpfUtils.limpar(cpf);
    const cpfExistente = await this._repository.selecionarPorCpf(cpfLimpo);
    if (cpfExistente.length > 0)
      throw new AppError("CPF já cadastrado", 409);

    const emailExistente = await this._repository.selecionarPorEmail(email);
    if (emailExistente.length > 0)
      throw new AppError("Email já cadastrado", 409);

    let usuario: Usuario;

    try {
      usuario = Usuario.criar(nome, cpf, email, senha, dataNascimento, estadoCivil);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Dados inválidos";
      throw new AppError(message, 400);
    }

    const senhaHash = await hashSenha(senha);
    usuario.definirSenhaHash(senhaHash);

    const resultado = await this._repository.criar({
      nome: usuario.Nome,
      cpf: CpfUtils.limpar(usuario.Cpf),
      email: usuario.Email,
      senha: usuario.Senha,
      dataNascimento: usuario.DataNascimentoFormatada,
      estadoCivil: usuario.EstadoCivil,
    });

    const token = jwt.sign(
      { id: resultado.insertId, email: usuario.Email },
      process.env.JWT_SECRET as string,
      { expiresIn: "8h" }
    );

    return { token };
  }

  async editar(
    id: string,
    nome: string,
    cpf: string,
    email: string,
    senha: string,
    dataNascimento: string,
    estadoCivil: EstadoCivil
  ) {
    const usuarioExistente = await this._repository.selecionarPorId(id);
    if (usuarioExistente.length === 0)
      throw new AppError("Usuário não encontrado", 404);

    let usuario: Usuario;

    try {
      usuario = Usuario.editar(nome, cpf, email, senha, dataNascimento, estadoCivil, id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Dados inválidos";
      throw new AppError(message, 400);
    }

    const senhaHash = await hashSenha(senha);
    usuario.definirSenhaHash(senhaHash);

    return await this._repository.editar(id, {
      nome: usuario.Nome,
      cpf: CpfUtils.limpar(usuario.Cpf),
      email: usuario.Email,
      senha: usuario.Senha,
      dataNascimento: usuario.DataNascimentoFormatada,
      estadoCivil: usuario.EstadoCivil,
    });
  }

  async deletar(id: string) {
    const usuarioExistente = await this._repository.selecionarPorId(id);
    if (usuarioExistente.length === 0)
      throw new AppError("Usuário não encontrado", 404);

    return await this._repository.deletar(id);
  }

  async login(email: string, senha: string) {
    if (!email || !senha)
      throw new AppError("Informe e-mail e senha", 400);

    if (!EMAIL_REGEX.test(String(email).trim()))
      throw new AppError("Digite um e-mail válido", 400);

    const [usuario] = await this._repository.selecionarPorEmail(String(email).trim());
    if (!usuario)
      throw new AppError("Email ou senha inválidos", 401);

    const senhaValida = await compararSenha(senha, usuario.senha);
    if (!senhaValida)
      throw new AppError("Email ou senha inválidos", 401);

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "8h" }
    );

    return { token };
  }
}