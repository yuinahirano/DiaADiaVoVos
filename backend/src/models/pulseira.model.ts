import { RowDataPacket } from "mysql2";

export interface IPulseira extends RowDataPacket {
  id?: string;
  idCuidador: string;
  idIdoso: string;
  nome: string;
  deviceToken?: string | null;
  vinculadaEm?: Date | null;
}

export class Pulseira {
  private _id?: string;
  private _nome!: string;
  private _idIdoso!: string;
  private _idCuidador!: string;

  constructor(
    nome: string,
    idIdoso: string,
    idCuidador: string,
    id?: string,
  ) {
    this._id = id;
    this._idIdoso = idIdoso;
    this._idCuidador = idCuidador;
    this._nome = nome;
  }

  public get Id(): string | undefined {
    return this._id;
  }

  public get IdIdoso(): string {
    return this._idIdoso;
  }

  public get IdCuidador(): string {
    return this._idCuidador;
  }

  public get Nome(): string {
    return this._nome;
  }

  public set Id(value: string) {
    this._validarId(value);
    this._id = value;
  }

  public set IdIdoso(value: string) {
    this._validarIdIdoso(value);
    this._idIdoso = value;
  }

  public set IdCuidador(value: string) {
    this._validarIdCuidador(value);
    this._idCuidador = value;
  }

  public set Nome(value: string) {
    this._validarNome(value);
    this._nome = value;
  }

  private _validarId(value: string): void {
    if (!value || value.trim().length < 3)
      throw new Error("O campo id está incompleto");
  }

  private _validarIdIdoso(value: string): void {
    if (!value || value.trim().length < 3)
      throw new Error("O campo idIdoso está incompleto");
  }

  private _validarIdCuidador(value: string): void {
    if (!value || value.trim().length < 3)
      throw new Error("O campo idCuidador está incompleto");
  }

  private _validarNome(value: string): void {
    if (!value || value.trim().length < 3)
      throw new Error("O campo nome está incompleto");
  }

  public static criar(
    nome: string,
    idIdoso: string,
    idCuidador: string,
  ): Pulseira {
    return new Pulseira(nome, idIdoso, idCuidador);
  }

  public static editar(
    nome: string,
    idIdoso: string,
    idCuidador: string,
    id: string,
  ): Pulseira {
    return new Pulseira(nome, idIdoso, idCuidador, id);
  }
}