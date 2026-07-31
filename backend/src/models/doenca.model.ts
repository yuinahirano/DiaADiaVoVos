import { RowDataPacket } from "mysql2";

export interface IDoenca extends RowDataPacket {
  id?: string;
  nome: string;
  descricao: string;
  idIdoso: string;
}

export class Doenca {
  private _id?: string;
  private _nome!: string;
  private _descricao!: string;
  private _idIdoso!: string;

  constructor(
      nome: string,
      descricao: string,
      idIdoso: string,
      id?: string,
  ) {
    this._id = id;
    this._idIdoso = idIdoso;
    this._nome = nome;
    this._descricao = descricao;
  }
  
  public get Id(): string | undefined {
    return this._id;
  }
  
  public get Descricao(): string{
    return this._descricao;
  }
  
  public get IdIdoso(): string {
    return this._idIdoso;
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
        public set Nome(value: string) {
    this._validarNome(value);
    this._nome = value;
  }
          public set Descricao(value: string) {
    this._validarDescricao(value);
    this._descricao = value;
  }

  
private _validarId(value: string): void {
    if (!value || value.trim().length < 3)
        throw new Error("O campo id está incompleto");
    this._id = value;
}

private _validarIdIdoso(value: string): void {
    if (!value || value.trim().length < 3)
        throw new Error("O campo idIdoso está incompleto");
    this._id = value;
}

private _validarNome(value: string): void {
    if (!value || value.trim().length < 3)
        throw new Error("O campo nome está incompleto");
    this._id = value;
}

private _validarDescricao(value: string): void {
    if (!value || value.trim().length < 3)
        throw new Error("O campo descricao está incompleto");
    this._id = value;
}
  
  public static criar(
    nome: string,
    descricao: string,
    idIdoso: string,
  ): Doenca {
    return new Doenca( nome, descricao, idIdoso);
  }
  
  public static editar(
      nome: string,
      descricao: string,
      idIdoso: string,
      id: string,
  ): Doenca {
    return new Doenca( nome, descricao, idIdoso, id);
  }
}