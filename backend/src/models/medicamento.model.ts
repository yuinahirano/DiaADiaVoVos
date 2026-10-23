import { RowDataPacket } from "mysql2";
import { TipoFrequencia } from "../enums/tipo-frequencia.enum";
import { StatusMedicamento } from "../enums/status-medicamento.enum";

export interface IMedicamento extends RowDataPacket {
  nome: string;
  dosagem: string;
  horario: string;
  tipoFrequencia: TipoFrequencia;
  valorFrequencia: number;
  intervaloMinutos: number;
  proximoHorario: Date;
  ultimaDose?: Date | null;
  status: StatusMedicamento;
  idIdoso: string;
  observacoes?: string;
  id?: string;
}

export class Medicamento {
  private _nome: string;
  private _dosagem: string;
  private _horario: string;
  private _tipoFrequencia: TipoFrequencia;
  private _valorFrequencia: number;
  private _intervaloMinutos: number;
  private _proximoHorario: Date;
  private _ultimaDose?: Date | null;
  private _status: StatusMedicamento;
  private _idIdoso: string;
  private _observacoes?: string;
  private _id?: string;

  constructor(
    nome: string,
    dosagem: string,
    horario: string,
    tipoFrequencia: TipoFrequencia,
    valorFrequencia: number,
    intervaloMinutos: number,
    proximoHorario: Date,
    status: StatusMedicamento,
    idIdoso: string,
    observacoes?: string,
    ultimaDose?: Date | null,
    id?: string
  ) {
    this._nome = nome;
    this._dosagem = dosagem;
    this._horario = horario;
    this._tipoFrequencia = tipoFrequencia;
    this._valorFrequencia = valorFrequencia;
    this._intervaloMinutos = intervaloMinutos;
    this._proximoHorario = proximoHorario;
    this._status = status;
    this._idIdoso = idIdoso;
    this._observacoes = observacoes;
    this._ultimaDose = ultimaDose;
    this._id = id;
  }

  // Getters
  public get Id(): string | undefined {
    return this._id;
  }
  public get Observacoes(): string | undefined {
    return this._observacoes;
  }
  public get Nome(): string {
    return this._nome;
  }
  public get Dosagem(): string {
    return this._dosagem;
  }
  public get Horario(): string {
    return this._horario;
  }
  public get TipoFrequencia(): TipoFrequencia {
    return this._tipoFrequencia;
  }
  public get ValorFrequencia(): number {
    return this._valorFrequencia;
  }
  public get IntervaloMinutos(): number {
    return this._intervaloMinutos;
  }
  public get ProximoHorario(): Date {
    return this._proximoHorario;
  }
  public get UltimaDose(): Date | null | undefined {
    return this._ultimaDose;
  }
  public get Status(): StatusMedicamento {
    return this._status;
  }
  public get IdIdoso(): string {
    return this._idIdoso;
  }

  // Setters
  public set Id(value: string) {
    this._validarId(value);
    this._id = value;
  }
  public set Observacoes(value: string) {
    this._validarObservacoes(value);
    this._observacoes = value;
  }
  public set Nome(value: string) {
    this._validarNome(value);
    this._nome = value;
  }
  public set Dosagem(value: string) {
    this._validarDosagem(value);
    this._dosagem = value;
  }
  public set Horario(value: string) {
    this._validarHorario(value);
    this._horario = value;
  }
  public set TipoFrequencia(value: TipoFrequencia) {
    this._validarTipoFrequencia(value);
    this._tipoFrequencia = value;
  }
  public set ValorFrequencia(value: number) {
    this._validarValorFrequencia(value, this._tipoFrequencia);
    this._valorFrequencia = value;
  }
  public set Status(value: StatusMedicamento) {
    this._validarStatus(value);
    this._status = value;
  }
  public set IdIdoso(value: string) {
    this._validarIdIdoso(value);
    this._idIdoso = value;
  }

  // Métodos de Validação (Apenas validam o valor recebido)
  private static _validarId(value: string): void {
    if (!value || value.trim().length < 3)
      throw new Error("O campo id está incompleto");
  }
  private _validarId(value: string): void {
    Medicamento._validarId(value);
  }
  private _validarObservacoes(value: string): void {
    if (!value || value.trim().length < 3)
      throw new Error("O campo observacoes está incompleto");
  }
  private static _validarNome(value: string): void {
    if (!value || value.trim().length < 3)
      throw new Error("O campo nome está incompleto");
  }
  private _validarNome(value: string): void {
    Medicamento._validarNome(value);
  }
  private static _validarDosagem(value: string): void {
    if (!value || value.trim().length < 3)
      throw new Error("O campo dosagem está incompleto");
  }
  private _validarDosagem(value: string): void {
    Medicamento._validarDosagem(value);
  }
  private static _validarHorario(value: string): void {
    if (!value || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value))
      throw new Error("O campo horario deve estar no formato HH:mm");
  }
  private _validarHorario(value: string): void {
    Medicamento._validarHorario(value);
  }
  private static _validarTipoFrequencia(value: TipoFrequencia): void {
    if (!Object.values(TipoFrequencia).includes(value))
      throw new Error("O campo tipoFrequencia é inválido");
  }
  private _validarTipoFrequencia(value: TipoFrequencia): void {
    Medicamento._validarTipoFrequencia(value);
  }
  private static _validarValorFrequencia(
    value: number,
    tipo: TipoFrequencia
  ): void {
    if (!Number.isInteger(value) || value < 1)
      throw new Error("O campo valorFrequencia deve ser um inteiro maior que zero");
    if (tipo === TipoFrequencia.VEZES_POR_DIA && value > 24)
      throw new Error("O campo valorFrequencia não pode passar de 24 vezes por dia");
    if (tipo === TipoFrequencia.INTERVALO_HORAS && value > 168)
      throw new Error("O campo valorFrequencia não pode passar de 168 horas");
  }
  private _validarValorFrequencia(value: number, tipo: TipoFrequencia): void {
    Medicamento._validarValorFrequencia(value, tipo);
  }
  private _validarStatus(value: StatusMedicamento): void {
    if (!Object.values(StatusMedicamento).includes(value))
      throw new Error("O campo status é inválido");
  }
  private static _validarIdIdoso(value: string): void {
    if (!value || value.trim().length < 3)
      throw new Error("O campo idIdoso está incompleto");
  }
  private _validarIdIdoso(value: string): void {
    Medicamento._validarIdIdoso(value);
  }

  // Métodos de Cálculo
  public static calcularIntervaloMinutos(
    tipo: TipoFrequencia,
    valor: number
  ): number {
    if (tipo === TipoFrequencia.VEZES_POR_DIA) return Math.round(1440 / valor);
    return valor * 60;
  }

  public static calcularProximoHorario(
    horario: string,
    intervaloMinutos: number,
    referencia: Date = new Date()
  ): Date {
    const [horas, minutos] = horario.split(":").map(Number);
    const proximo = new Date(referencia);
    proximo.setHours(horas, minutos, 0, 0);
    while (proximo.getTime() <= referencia.getTime()) {
      proximo.setTime(proximo.getTime() + intervaloMinutos * 60000);
    }
    return proximo;
  }

  public static avancarHorario(
    proximoAtual: Date,
    intervaloMinutos: number,
    referencia: Date = new Date()
  ): Date {
    const proximo = new Date(proximoAtual);
    do {
      proximo.setTime(proximo.getTime() + intervaloMinutos * 60000);
    } while (proximo.getTime() <= referencia.getTime());
    return proximo;
  }

  // Métodos Estáticos de Fábrica
  public static criar(
    nome: string,
    dosagem: string,
    horario: string,
    tipoFrequencia: TipoFrequencia,
    valorFrequencia: number,
    idIdoso: string,
    observacoes?: string
  ): Medicamento {
    Medicamento._validarNome(nome);
    Medicamento._validarDosagem(dosagem);
    Medicamento._validarHorario(horario);
    Medicamento._validarTipoFrequencia(tipoFrequencia);
    Medicamento._validarValorFrequencia(valorFrequencia, tipoFrequencia);
    Medicamento._validarIdIdoso(idIdoso);
    const intervaloMinutos = Medicamento.calcularIntervaloMinutos(
      tipoFrequencia,
      valorFrequencia
    );
    const proximoHorario = Medicamento.calcularProximoHorario(
      horario,
      intervaloMinutos
    );
    return new Medicamento(
      nome,
      dosagem,
      horario,
      tipoFrequencia,
      valorFrequencia,
      intervaloMinutos,
      proximoHorario,
      StatusMedicamento.ATIVO,
      idIdoso,
      observacoes
    );
  }

  public static editar(
    nome: string,
    dosagem: string,
    horario: string,
    tipoFrequencia: TipoFrequencia,
    valorFrequencia: number,
    idIdoso: string,
    status: StatusMedicamento,
    observacoes?: string,
    id?: string
  ): Medicamento {
    Medicamento._validarNome(nome);
    Medicamento._validarDosagem(dosagem);
    Medicamento._validarHorario(horario);
    Medicamento._validarTipoFrequencia(tipoFrequencia);
    Medicamento._validarValorFrequencia(valorFrequencia, tipoFrequencia);
    Medicamento._validarIdIdoso(idIdoso);
    const intervaloMinutos = Medicamento.calcularIntervaloMinutos(
      tipoFrequencia,
      valorFrequencia
    );
    const proximoHorario = Medicamento.calcularProximoHorario(
      horario,
      intervaloMinutos
    );
    return new Medicamento(
      nome,
      dosagem,
      horario,
      tipoFrequencia,
      valorFrequencia,
      intervaloMinutos,
      proximoHorario,
      status,
      idIdoso,
      observacoes,
      undefined,
      id
    );
  }
}