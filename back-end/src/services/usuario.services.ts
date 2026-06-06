import { UsuarioRepository } from "../repository/usuario.repository";
import { Usuario } from "../models/usuario.model";
import { EstadoCivil } from "../enums/estadoCivil.enums";
import { hashSenha, compararSenha } from "../config/bcrypt.config";
import { CpfUtils } from "../utils/validarCpf.utils";
import jwt from "jsonwebtoken";

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

  async criar(
    nome: string,
    cpf: string,
    email: string,
    senha: string,
    dataNascimento: number,
    estadoCivil: EstadoCivil
  ) {
    const cpfExistente = await this._repository.selecionarPorCpf(cpf);
    if (cpfExistente.length > 0)
      throw new Error("CPF já cadastrado");

    const emailExistente = await this._repository.selecionarPorEmail(email);
    if (emailExistente.length > 0)
      throw new Error("Email já cadastrado");

    const usuario = Usuario.criar(nome, cpf, email, senha, dataNascimento, estadoCivil);

    const senhaHash = await hashSenha(senha);
    usuario.definirSenhaHash(senhaHash);

    return await this._repository.criar({
      nome: usuario.Nome,
      cpf: CpfUtils.limpar(usuario.Cpf),
      email: usuario.Email,
      senha: usuario.Senha,
      dataNascimento: usuario.DataNascimentoFormatada,
      estadoCivil: usuario.EstadoCivil,
    });
  }

  async editar(
    id: string,
    nome: string,
    cpf: string,
    email: string,
    senha: string,
    dataNascimento: number,
    estadoCivil: EstadoCivil
  ) {
    const usuarioExistente = await this._repository.selecionarPorId(id);
    if (usuarioExistente.length === 0)
      throw new Error("Usuário não encontrado");

    const usuario = Usuario.editar(nome, cpf, email, senha, dataNascimento, estadoCivil, id);

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
      throw new Error("Usuário não encontrado");

    return await this._repository.deletar(id);
  }

  async login(email: string, senha: string) {
    const [usuario] = await this._repository.selecionarPorEmail(email);
    if (!usuario)
      throw new Error("Email ou senha inválidos");

    const senhaValida = await compararSenha(senha, usuario.senha);
    if (!senhaValida)
      throw new Error("Email ou senha inválidos");

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "8h" }
    );

    return { token };
  }
}