import { RowDataPacket } from "mysql2";
import { StatusSolicitacao } from "../enums/statusSolicitacao.enums";

export interface ISolicitacaoCuidador extends RowDataPacket {
  id?: string;
  idIdoso: string;
  idCuidador: string;
  status: StatusSolicitacao;
  expiraEm: Date;
}

export class SolicitacaoCuidador {
  private _id?: string;
  private _idIdoso!: string;
  private _idCuidador!: string;
  private _status!: StatusSolicitacao;
  private _expiraEm!: Date;

  constructor(
    idIdoso: string,
    idCuidador: string,
    status: StatusSolicitacao,
    expiraEm: Date,
    id?: string,
  ) {
    this._id = id;
    this.IdIdoso = idIdoso;
    this.IdCuidador = idCuidador;
    this.Status = status;
    this.ExpiraEm = expiraEm;
  }
  
  public get Id(): string | undefined {
    return this._id;
  }
  
  public get IdCuidador(): string{
    return this._idCuidador;
  }
  
  public get IdIdoso(): string {
    return this._idIdoso;
  }

  public get Status(): StatusSolicitacao {
    return this._status;
  }

  public get ExpiraEm(): Date {
    return this._expiraEm;
  }
  
  public set IdIdoso(value: string) {
    this._validarIdIdoso(value);
    this._idIdoso = value;
  }
  
  public set IdCuidador(value: string) {
    this._validarIdCuidador(value);
    this._idCuidador = value;
  }

  public set Status(value: StatusSolicitacao) {
    this._validarStatus(value);
    this._status = value;
  }

  public set ExpiraEm(value: Date) {
    this._expiraEm = value;
  }

  private _validarIdIdoso(value: string): void {
    if (!value || value.trim().length < 3)
        throw new Error("O campo idIdoso está incompleto");
    this._idIdoso = value;
  }

  private _validarIdCuidador(value: string): void {
    if (!value || value.trim().length < 3)
        throw new Error("O campo idCuidador está incompleto");
    this._idCuidador = value;
  }

  private _validarId(value: string): void {
    if (!value || value.trim().length < 3)
        throw new Error("O campo id está incompleto");
    this._id = value;
  }

  private _validarStatus(value: StatusSolicitacao): void {
    if (!Object.values(StatusSolicitacao).includes(value))
        throw new Error("O campo status é inválido");
  }

  public set Id(value: string) {
    this._validarId(value);
    this._id = value;
  }

  public estaExpirada(): boolean {
    return this._status === StatusSolicitacao.PENDENTE && new Date() > this._expiraEm;
  }

  public podeResponder(): boolean {
    return this._status === StatusSolicitacao.PENDENTE && !this.estaExpirada();
  }

  public aceitar(): void {
    if (!this.podeResponder())
        throw new Error("Solicitação não pode mais ser aceita");
    this.Status = StatusSolicitacao.ACEITA;
  }

  public recusar(): void {
    if (!this.podeResponder())
        throw new Error("Solicitação não pode mais ser recusada");
    this.Status = StatusSolicitacao.RECUSADA;
  }

  public cancelar(): void {
    if (this._status !== StatusSolicitacao.PENDENTE)
        throw new Error("Só é possível cancelar uma solicitação pendente");
    this.Status = StatusSolicitacao.CANCELADA;
  }
   
public static criar(
    idIdoso: string,
    idCuidador: string,
    diasParaExpirar: number = 3,
  ): SolicitacaoCuidador {
    if (diasParaExpirar > 3 || diasParaExpirar <= 0) {
      throw new Error("O prazo de expiração deve ser de no máximo 3 dias");
    }

    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + diasParaExpirar);
    return new SolicitacaoCuidador(idIdoso, idCuidador, StatusSolicitacao.PENDENTE, expiraEm);
  }
  
  public static editar(
    id: string,
    idIdoso: string,
    idCuidador: string,
    status: StatusSolicitacao,
    expiraEm: Date,
  ): SolicitacaoCuidador {
    return new SolicitacaoCuidador(idIdoso, idCuidador, status, expiraEm, id);
  }
}