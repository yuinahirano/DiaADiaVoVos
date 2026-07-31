import { RowDataPacket } from "mysql2";

export interface IEndereco extends RowDataPacket {
  logradouro: string;
  numero: number;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  idUsuario: string;
  id?: string;
}

export class Endereco {
  private _id?: string;
  private _logradouro!: string;
  private _numero!: number;
  private _complemento: string | null = null;
  private _bairro!: string;
  private _cidade!: string;
  private _uf!: string;
  private _cep!: string;
  private _idUsuario!: string;

  constructor(
    logradouro: string,
    numero: number,
    complemento: string,
    bairro: string,
    cidade: string,
    uf: string,
    cep: string,
    idUsuario: string,
    id?: string,
  ) {
    this._logradouro = logradouro;
    this._numero = numero;
    this._complemento = complemento;
    this._bairro = bairro;
    this._cidade = cidade;
    this._uf = uf;
    this._cep = cep;
    this._idUsuario = idUsuario;
    this._id = id;
  }

  // getters
  public get Id(): string | undefined {
    return this._id;
  }

  public get Logradouro(): string {
    return this._logradouro;
  }

  public get Numero(): number {
    return this._numero;
  }

  public get Complemento(): string | null {
    return this._complemento;
  }

  public get Bairro(): string {
    return this._bairro;
  }

  public get Cidade(): string {
    return this._cidade;
  }

  public get Uf(): string {
    return this._uf;
  }

  public get Cep(): string {
    return this._cep;
  }

  public get IdUsuario(): string {
    return this._idUsuario;
  }

  // setters
  public set Logradouro(value: string) {
    this._validarLogradouro(value);
    this._logradouro = value;
  }

public set Numero(value: number) {
    this._validarNumero(value);
  this._numero = value;
}

  public set Complemento(value: string) {
    this._validarComplemento(value);
    this._complemento = value;
  }

  public set Bairro(value: string) {
    this._validarBairro(value);
    this._bairro = value;
  }

  public set Cidade(value: string) {
    this._validarCidade(value);
    this._cidade = value;
  }

  public set Uf(value: string) {
    this._validarUf(value);
    this._uf = value.toUpperCase();
  }

  public set Cep(value: string) {
    this._validarCep(value);
    this._cep = value;
  }

  // validações privadas
  private _validarLogradouro(value: string): void {
    if (!value || value.trim().length > 150) {
      throw new Error("O campo logradouro deve ter entre 1 a 150 caracteres");
    }
  }

  private _validarNumero(value: number): void {
  if (!value || String(value).length > 8) {
    throw new Error("O campo número deve ter entre 1 a 8 caracteres");
  }
}

  private _validarComplemento(value: string): void {
    if (!value || value.trim().length > 150) {
      throw new Error("O campo complemento deve ter no máximo 150 caracteres");
    }
  }

  private _validarBairro(value: string): void {
    if (!value || value.trim().length > 100) {
      throw new Error("O campo bairro deve ter entre 1 a 100 caracteres");
    }
  }

  private _validarCidade(value: string): void {
    if (!value || value.trim().length > 100) {
      throw new Error("O campo cidade deve ter entre 1 a 100 caracteres");
    }
  }

  private _validarUf(value: string): void {
    if (!value || value.trim().length !== 2) {
      throw new Error("O campo UF deve ter 2 caracteres");
    }
  }

  private _validarCep(value: string): void {
    const cepRegex = /^[0-9]{8}$/;
    if (!cepRegex.test(value)) {
      throw new Error("CEP inválido");
    }
  }
}