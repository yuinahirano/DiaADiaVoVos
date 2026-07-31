import { RowDataPacket } from "mysql2";
import { TelefoneUtils } from "../utils/validarTelefone";


export interface ICuidador extends RowDataPacket {
  id?: string;
  telefone: string;
  idImagem?: string;
  idUsuario: string;
}

export class Cuidador {
  private _id?: string;
  private _telefone!: string;
  private _idImagem?: string;
  private _idUsuario!: string;

constructor(
    telefone: string,
    idUsuario: string,
    idImagem?: string,
    id?: string,
) {
    this._id = id;
    this._idImagem = idImagem;
    this.Telefone = telefone;
    this.IdUsuario = idUsuario;
}

  
  public get Id(): string | undefined {
    return this._id;
  }
  
  
  public get Telefone(): string {
    return this._telefone;
  }
  
  
  public get IdImagem(): string | undefined {
    return this._idImagem;
  }
  
  public get IdUsuario(): string {
    return this._idUsuario;
  }
  
  public set Id(value: string) {
    this._validarId(value);
    this._id = value;
  }
  
  public set IdUsuario(value: string) {
this._validarIdUsuario(value);
this._idUsuario = value;
}

public set Telefone(value: string) {
  this._validarTelefone(value);
  this._telefone = value;
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
  
  private _validarTelefone(value: string): void {
    if (!TelefoneUtils.validar(value)) throw new Error("Telefone inválido");
  }


  public static criar(
    telefone: string,
    idUsuario: string,
    idImagem?: string,
  ): Cuidador {
    return new Cuidador( telefone, idUsuario, idImagem);
  }
  
  public static editar(
    id: string,
    telefone: string,
    idUsuario: string,
    idImagem?: string,
  ): Cuidador {
    return new Cuidador( telefone, idUsuario, idImagem, id);
  }
}