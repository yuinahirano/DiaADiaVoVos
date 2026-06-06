import { RowDataPacket } from "mysql2";
import { CpfUtils } from "../utils/validarCpf.utils";
import { DataUtils } from "../utils/validarDataNascimento.utils";
import { EmailUtils } from "../utils/validarEmail.utils";
import { SenhaUtils } from "../utils/validarSenha.utils";
import { EstadoCivil } from "../enums/estadoCivil.enums";

export interface IUsuario extends RowDataPacket {
  id?: string;
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  dataNascimento: string;
  estadoCivil: EstadoCivil;
}

export class Usuario {
  private _id?: string;
  private _nome!: string;
  private _cpf!: string;
  private _email!: string;
  private _senha!: string;
  private _dataNascimento!: number;
  private _estadoCivil!: EstadoCivil;

  constructor(
    nome: string,
    cpf: string,
    email: string,
    senha: string,
    dataNascimento: number,
    estadoCivil: EstadoCivil,
    id?: string,
  ) {
    this._id = id;
    this.Nome = nome;
    this.Cpf = cpf;
    this.Email = email;
    this.Senha = senha;
    this.DataNascimento = dataNascimento;
    this.EstadoCivil = estadoCivil;
  }

  public get Id(): string | undefined {
    return this._id;
  }

  public get Nome(): string {
    return this._nome;
  }

  public get Cpf(): string {
    return this._cpf;
  }

  public get Email(): string {
    return this._email;
  }

  public get Senha(): string {
    return this._senha;
  }

  public get DataNascimento(): number {
    return this._dataNascimento;
  }

  public get EstadoCivil(): EstadoCivil {
    return this._estadoCivil;
  }

  public set Nome(value: string) {
    this._validarNome(value);
    this._nome = value;
  }

  private _validarNome(value: string): void {
    if (!value || value.trim().length < 3)
      throw new Error("O campo nome deve ter pelo menos 3 caracteres");
  }

  public set Cpf(value: string) {
    this._validarCpf(value);
    this._cpf = value;
  }

  private _validarCpf(value: string): void {
    if (!CpfUtils.validar(value)) throw new Error("CPF inválido");
  }

  public set Email(value: string) {
    this._validarEmail(value);
    this._email = value;
  }

  private _validarEmail(value: string): void {
    const { valido, erros } = EmailUtils.validar(value);
    if (!valido) throw new Error(erros.join(", "));
  }

  public set Senha(value: string) {
    this._validarSenha(value);
    this._senha = value;
  }

  private _validarSenha(value: string): void {
    const { valido, erros } = SenhaUtils.validar(value);
    if (!valido) throw new Error(erros.join(", "));
  }

  public definirSenhaHash(hash: string): void {
    this._senha = hash;
  }

  public set DataNascimento(value: number) {
    this._validarDataNascimento(value);
    this._dataNascimento = value;
  }

  private _validarDataNascimento(value: number): void {
    if (!DataUtils.validarData(value))
      throw new Error("Data de nascimento inválida");

    if (!DataUtils.validarDataPassado(value))
      throw new Error("Data de nascimento deve ser no passado");

    if (!DataUtils.validarIdadeMinima(value, 18))
      throw new Error("Usuário deve ter pelo menos 18 anos");
  }

  public set EstadoCivil(value: EstadoCivil) {
    this._validarEstadoCivil(value);
    this._estadoCivil = value;
  }

  private _validarEstadoCivil(value: EstadoCivil): void {
    if (!value) throw new Error("Estado civil é obrigatório");
  }

  public get DataNascimentoFormatada(): string {
    const str = this._dataNascimento.toString();
    return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
  }

  public static criar(
    nome: string,
    cpf: string,
    email: string,
    senha: string,
    dataNascimento: number,
    estadoCivil: EstadoCivil,
  ): Usuario {
    return new Usuario(nome, cpf, email, senha, dataNascimento, estadoCivil);
  }

  public static editar(
    nome: string,
    cpf: string,
    email: string,
    senha: string,
    dataNascimento: number,
    estadoCivil: EstadoCivil,
    id: string,
  ): Usuario {
    return new Usuario(nome, cpf, email, senha, dataNascimento, estadoCivil, id);
  }
}