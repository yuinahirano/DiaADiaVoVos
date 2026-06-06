// A camada Service é responsável pela lógica de negócio da aplicação.
// Ela fica entre o Controller (que recebe as requisições) e o Repository (que acessa o banco).
// Aqui ficam regras como: verificar duplicatas, hashear senhas e gerar tokens JWT.
import { UsuarioRepository } from "../repository/usuario.repository";
import { Usuario } from "../models/usuario.model";
import { EstadoCivil } from "../enums/estadoCivil.enums";
import { hashSenha, compararSenha } from "../config/bcrypt.config";
import jwt from "jsonwebtoken";

export class UsuarioService {
  constructor(private _repository = new UsuarioRepository()) {}

  async selecionarTodos() {
    return await this._repository.selecionarTodos();
  }

  async selecionarPorId(id: number) {
    return await this._repository.selecionarPorId(id);
  }

  async criar(
    nome: string,
    cpf: string,
    email: string,
    senha: string,
    dataNascimento: number,
    estadoCivil: EstadoCivil
  ) {
    // verifica se CPF já está cadastrado
    const cpfExistente = await this._repository.selecionarPorCpf(cpf);
    if (cpfExistente.length > 0)
      throw new Error("CPF já cadastrado");

    // verifica se email já está cadastrado
    const emailExistente = await this._repository.selecionarPorEmail(email);
    if (emailExistente.length > 0)
      throw new Error("Email já cadastrado");

    const senhaHash = await hashSenha(senha);
    // hasheia a senha antes de salvar — a classe valida o formato, o service faz o hash

    const usuario = Usuario.criar(nome, cpf, email, senhaHash, dataNascimento, estadoCivil);
    return await this._repository.criar(usuario);
  }

  async editar(
    id: number,
    nome: string,
    cpf: string,
    email: string,
    senha: string,
    dataNascimento: number,
    estadoCivil: EstadoCivil
  ) {
    // verifica se o usuário existe
    const usuarioExistente = await this._repository.selecionarPorId(id);
    if (usuarioExistente.length === 0)
      throw new Error("Usuário não encontrado");

    const senhaHash = await hashSenha(senha);

    const usuario = Usuario.editar(nome, cpf, email, senhaHash, dataNascimento, estadoCivil, id);
    return await this._repository.editar(id, usuario);
  }

  async deletar(id: number) {
    const usuarioExistente = await this._repository.selecionarPorId(id);
    if (usuarioExistente.length === 0)
      throw new Error("Usuário não encontrado");

    return await this._repository.deletar(id);
  }

  async login(email: string, senha: string) {
    // busca o usuário pelo email
    const [usuario] = await this._repository.selecionarPorEmail(email);
    if (!usuario)
      throw new Error("Email ou senha inválidos");

    // compara a senha digitada com o hash do banco
    const senhaValida = await compararSenha(senha, usuario.senha);
    if (!senhaValida)
      throw new Error("Email ou senha inválidos");

    // gera o token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "8h" }
    );

    return { token };
  }
}