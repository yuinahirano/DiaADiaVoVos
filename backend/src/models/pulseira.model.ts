import { RowDataPacket } from "mysql2";

export const INTERVALO_MIN_SEG = 20; // a medição leva ~15 s
export const INTERVALO_MAX_SEG = 86400; // 24 h
export const INTERVALO_PADRAO_SEG = 600; // 10 min

// Erro de dado inválido enviado pelo cliente (o controller responde 400)
export class ErroValidacao extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ErroValidacao.prototype);
  }
}

export function validarIntervalo(value: unknown): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < INTERVALO_MIN_SEG || n > INTERVALO_MAX_SEG)
    throw new ErroValidacao(
      `O intervalo de leitura deve ser um número inteiro entre ${INTERVALO_MIN_SEG} e ${INTERVALO_MAX_SEG} segundos`,
    );
  return n;
}

export interface IPulseira extends RowDataPacket {
  id?: string;
  idCuidador: string;
  idIdoso: string;
  nome: string;
  intervaloLeituraSeg?: number;
  deviceToken?: string | null;
  vinculadaEm?: Date | null;
}

export class Pulseira {
  private _id?: string;
  private _nome!: string;
  private _idIdoso!: string;
  private _idCuidador!: string;
  private _intervaloLeituraSeg: number = INTERVALO_PADRAO_SEG;

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

  public get IntervaloLeituraSeg(): number {
    return this._intervaloLeituraSeg;
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

  public set IntervaloLeituraSeg(value: number) {
    this._intervaloLeituraSeg = validarIntervalo(value);
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
    intervaloLeituraSeg: number = INTERVALO_PADRAO_SEG,
  ): Pulseira {
    const pulseira = new Pulseira(nome, idIdoso, idCuidador);
    pulseira.IntervaloLeituraSeg = intervaloLeituraSeg; // valida
    return pulseira;
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