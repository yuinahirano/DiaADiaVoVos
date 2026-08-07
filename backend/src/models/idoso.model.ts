import { RowDataPacket } from "mysql2";
import { TelefoneUtils } from "../utils/validarTelefone";
import { Pcd } from "../enums/pcd.enums";

export interface IIdoso extends RowDataPacket {
  id?: string;
  tipoSanguineo: string;
  telefone: string;
  pcd: Pcd;
  idImagem?: string;
  idUsuario: string;
}

export class Idoso {
  private _id?: string;
  private _tipoSanguineo!: string;
  private _telefone!: string;
  private _pcd!: Pcd;
  private _idImagem?: string;
  private _idUsuario!: string;

  constructor(
    tipoSanguineo: string,
    telefone: string,
    pcd: Pcd,
    idUsuario: string,
    idImagem?: string,
    id?: string,
  ) {
    this._id = id;
    this._tipoSanguineo = tipoSanguineo;
    this._telefone = telefone;
    this._pcd = pcd;
    this._idImagem = idImagem;
    this._idUsuario = idUsuario;
  }

  
  public get Id(): string | undefined {
    return this._id;
  }
  
  public get TipoSanguineo(): string {
    return this._tipoSanguineo;
  }
  
  public get Telefone(): string {
    return this._telefone;
  }
  
  public get Pcd(): Pcd {
    return this._pcd;
  }
  
  public get IdImagem(): string | undefined {
    return this._idImagem;
  }
  
  public get IdUsuario(): string {
    return this._idUsuario;
  }

    public set IdUsuario(value: string) {
    this._validarIdUsuario(value);
    this._idUsuario = value;
  }

      public set Id(value: string) {
    this._validarId(value);
    this._id = value;
  }


  
  public set TipoSanguineo(value: string) {
    this._validarTipoSanguineo(value);
    this._tipoSanguineo = value;
  }
  
  public set Telefone(value: string) {
    this._validarTelefone(value);
    this._telefone = value;
  }
  
  public set Pcd(value: Pcd) {
    this._validarPcd(value);
    this._pcd = value;
  }

  private _validarTelefone(value: string): void {
    if (!TelefoneUtils.validar(value)) throw new Error("Telefone inválido");
  }
  


private _validarPcd(value: Pcd): void {
    if (!value) throw new Error("PCD é obrigatório");
    this._pcd = value;
}

private _validarId(value: string): void {
    if (!value || value.trim().length < 3)
        throw new Error("O campo id está incompleto");
    this._id = value;
}

private _validarIdUsuario(value: string): void {
    if (!value || value.trim().length < 3)
        throw new Error("O campo idUsuario está incompleto");
    this._idUsuario = value;
}

private _validarTipoSanguineo(value: string): void {
    if (!value || value.trim().length < 2)
        throw new Error("O campo TipoSanguineo deve ter pelo menos 2 caracteres");
    this._tipoSanguineo = value;
}
  
  public static criar(
    tipoSanguineo: string,
    telefone: string,
    pcd: Pcd,
    idUsuario: string,
    idImagem?: string,
  ): Idoso {
    return new Idoso(tipoSanguineo, telefone, pcd, idUsuario, idImagem);
  }
  
  public static editar(
    id: string,
    tipoSanguineo: string,
    telefone: string,
    pcd: Pcd,
    idUsuario: string,
    idImagem?: string,
  ): Idoso {
    return new Idoso(tipoSanguineo, telefone, pcd, idUsuario, idImagem, id);
  }
}