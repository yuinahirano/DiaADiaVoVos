import { RowDataPacket } from "mysql2";
import { TelefoneUtils } from "../utils/validarTelefone";

export interface IIdosoCuidador extends RowDataPacket {
  id?: string;
  idIdoso: string;
  idCuidador: string;
  telefoneEmergencia: string;
}

export class IdosoCuidador {
  private _id?: string;
  private _idIdoso!: string;
  private _idCuidador!: string;
  private _telefoneEmergencia!: string;

constructor(
    idIdoso: string,
    idCuidador: string,
    telefoneEmergencia: string,
    id?: string,
) {
    this._id = id;
    this.IdIdoso = idIdoso;
    this.IdCuidador = idCuidador;
    this.Telefone = telefoneEmergencia;
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
    
  public get TelefoneEmergencia(): string {
    return this._telefoneEmergencia;
  }
  
    public set IdIdoso(value: string) {
    this._validarIdIdoso(value);
    this._idIdoso = value;
  }

  
  public set IdCuidador(value: string) {
    this._validarIdCuidador(value);
    this._idCuidador = value;
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

  public set Id(value: string) {
    this._validarId(value);
    this._id = value;
  }


    public set Telefone(value: string) {
    this._telefoneEmergencia = value;
  }
   

  public static criar(
    idIdoso: string,
    idCuidador: string,
    telefoneEmergencia: string,
  ): IdosoCuidador {
    return new IdosoCuidador( idIdoso, idCuidador, telefoneEmergencia);
  }
  
  public static editar(
    id: string,
    idIdoso: string,
    idCuidador: string,
    telefoneEmergencia: string,
  ): IdosoCuidador {
    return new IdosoCuidador( idIdoso, idCuidador, telefoneEmergencia, id);
  }
}