import { RowDataPacket } from "mysql2";

export interface IConsulta extends RowDataPacket {
    nomeMedico: string,
    horario: string,
    localConsulta: string,
    idIdoso: string,
    data: string,
    compareceu?: boolean,
    id?: string,
}

export class Consulta {
  private _id?: string;
  private _nomeMedico!: string;
  private _horario: string;
  private _localconsulta!: string;
  private _idIdoso!: string;
  private _data!: string;
  private _compareceu: boolean;

  constructor(
    nomeMedico: string,
    horario: string,
    localConsulta: string,
    idIdoso: string,
    data: string,
    id?: string,
    compareceu: boolean = false,
  ) {
    this._id = id;
    this._nomeMedico = nomeMedico;
    this._horario = horario;
    this._localconsulta = localConsulta;
    this._idIdoso = idIdoso;
    this._data = data;
    this._compareceu = compareceu;
  }

  public get Id(): string | undefined {
    return this._id;
  }
    
  public get NomeMedico(): string {
    return this._nomeMedico;
  }

  public get Horario(): string {
    return this._horario;
  }
  public get LocalConsulta(): string {
    return this._localconsulta;
  }
  public get IdIdoso(): string {
    return this._idIdoso;
  }
  public get Data(): string {
    return this._data;
  }
  public get Compareceu(): boolean {
    return this._compareceu;
  }

  public set Id(value: string) {
    this._validarId(value);
    this._id = value;
  }
  public set NomeMedico(value: string) {
    this._validarNomeMedico(value);
    this._nomeMedico = value;
  }
  public set LocalConsulta(value: string) {
    this._validarLocalConsulta(value);
    this._localconsulta = value;
  }
  public set IdIdoso(value: string) {
    this._validarIdIdoso(value);
    this._idIdoso = value;
  }
  public set Horario(value: string) {
    this._validarHorario(value);
    this._horario = value;
  }
  public set Data(value: string) {
    this._validarData(value);
    this._data = value;
  }
  public set Compareceu(value: boolean) {
    this._validarCompareceu(value);
    this._compareceu = value;
  }
  
  private _validarId(value: string): void {
      if (!value || value.trim().length < 3)
          throw new Error("O campo id está incompleto");
      this._id = value;
  }
  private _validarNomeMedico(value: string): void {
      if (!value || value.trim().length < 3)
          throw new Error("O campo nome médico está incompleto");
      this._nomeMedico = value;
  }
  private _validarHorario(value: string): void {
      if (!value || value.trim().length < 4)
          throw new Error("O campo horario está incompleto");
      this._horario = value;
  }
  private _validarLocalConsulta(value: string): void {
      if (!value || value.trim().length < 3)
          throw new Error("O campo validarLocalConsulta está incompleto");
      this._localconsulta = value;
  }
  private _validarIdIdoso(value: string): void {
      if (!value || value.trim().length < 3)
          throw new Error("O campo idIdoso está incompleto");
      this._idIdoso = value;
  }
  private _validarData(value: string): void {
      if (!value || value.trim().length < 8)
          throw new Error("O campo data está incompleto");
      const dataConvertida = new Date(value);
      if (isNaN(dataConvertida.getTime()))
          throw new Error("O campo data possui um formato inválido");
      this._data = value;
  }
  private _validarCompareceu(value: boolean): void {
      if (typeof value !== "boolean")
          throw new Error("O campo compareceu deve ser um valor booleano");
      this._compareceu = value;
  }

  public static criar(
    nomeMedico: string,
    horario: string,
    localConsulta: string,
    idIdoso: string,
    data: string,
  ): Consulta {
    return new Consulta(nomeMedico, horario, localConsulta, idIdoso, data);
  }
  
  public static editar(
      nomeMedico: string,
      horario: string,
      localConsulta: string,
      idIdoso: string,
      data: string,
      id: string,
    ): Consulta {
    return new Consulta(nomeMedico, horario, localConsulta, idIdoso, data, id);
  }
}