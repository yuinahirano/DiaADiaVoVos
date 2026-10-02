import { RowDataPacket } from "mysql2";

export interface ILeitura extends RowDataPacket {
  id?: string;
  idPulseira: string;
  bpm: number;
  spo2: number;
  medidoEm?: Date;
}

export class Leitura {
  private _id?: string;
  private _idPulseira!: string;
  private _bpm!: number;
  private _spo2!: number;

  constructor(
    idPulseira: string,
    bpm: number,
    spo2: number,
    id?: string,
  ) {
    this._id = id;
    this._idPulseira = idPulseira;
    this._bpm = bpm;
    this._spo2 = spo2;
  }

  public get Id(): string | undefined {
    return this._id;
  }

  public get IdPulseira(): string {
    return this._idPulseira;
  }

  public get Bpm(): number {
    return this._bpm;
  }

  public get Spo2(): number {
    return this._spo2;
  }

  public set Id(value: string) {
    this._validarId(value);
    this._id = value;
  }

  public set IdPulseira(value: string) {
    this._validarIdPulseira(value);
    this._idPulseira = value;
  }

  public set Bpm(value: number) {
    this._validarBpm(value);
    this._bpm = value;
  }

  public set Spo2(value: number) {
    this._validarSpo2(value);
    this._spo2 = value;
  }

  private _validarId(value: string): void {
    if (!value || value.trim().length < 3)
      throw new Error("O campo id está incompleto");
  }

  private _validarIdPulseira(value: string): void {
    if (!value || value.trim().length < 3)
      throw new Error("O campo idPulseira está incompleto");
  }

  private _validarBpm(value: number): void {
    if (!Number.isInteger(value) || value < 50 || value > 170)
      throw new Error("O campo bpm deve ser um número inteiro entre 50 e 170");
  }

  private _validarSpo2(value: number): void {
    if (!Number.isInteger(value) || value < 50 || value > 100)
      throw new Error("O campo spo2 deve ser um número inteiro entre 50 e 100");
  }

  public static criar(
    idPulseira: string,
    bpm: number,
    spo2: number,
  ): Leitura {
    return new Leitura(idPulseira, bpm, spo2);
  }

  public static editar(
    idPulseira: string,
    bpm: number,
    spo2: number,
    id: string,
  ): Leitura {
    return new Leitura(idPulseira, bpm, spo2, id);
  }
}