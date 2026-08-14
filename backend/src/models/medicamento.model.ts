import { RowDataPacket } from "mysql2";

export interface IMedicamento extends RowDataPacket {
    nome: string,
    dosagem: string,
    horario: string,
    frequencia: string,
    idIdoso: string,
    observacoes?: string,
    id?: string,
}
export class Medicamento {
    private _nome: string;
    private _dosagem: string;
    private _horario: string;
    private _frequencia: string;
    private _idIdoso: string;
    private _observacoes?: string;
    private _id?: string;

  constructor(
    nome: string,
    dosagem: string,
    horario: string,
    frequencia: string,
    idIdoso: string,
    observacoes?: string,
    id?: string,
  ) {
    this._nome = nome
    this._dosagem = dosagem
    this._horario = horario
    this._frequencia = frequencia
    this._idIdoso = idIdoso
    this._observacoes = observacoes
    this._id = id
  }
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
  }      public get Horario(): string {
    return this._horario;
  }
   public get Frequencia(): string {
    return this._frequencia;
  }      public get IdIdoso(): string {
    return this._idIdoso;
  }


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
    public set frequencia(value: string) {
    this._validarFrequencia(value);
    this._frequencia = value;
  }
    public set IdIdoso(value: string) {
    this._validarIdIdoso(value);
    this._idIdoso = value;
  }

  private _validarId(value: string): void {
    if (!value || value.trim().length < 3)
        throw new Error("O campo id está incompleto");
    this._id = value;
}
  private _validarObservacoes(value: string): void {
    if (!value || value.trim().length < 3)
        throw new Error("O campo observacoes está incompleto");
    this._id = value;
}
  private _validarNome(value: string): void {
    if (!value || value.trim().length < 3)
        throw new Error("O campo nome está incompleto");
    this._id = value;
}
  private _validarDosagem(value: string): void {
    if (!value || value.trim().length < 3)
        throw new Error("O campo dosagem está incompleto");
    this._id = value;
}
  private _validarFrequencia(value: string): void {
    if (!value || value.trim().length < 3)
        throw new Error("O campo frequencia está incompleto");
    this._id = value;
}
  private _validarIdIdoso(value: string): void {
    if (!value || value.trim().length < 3)
        throw new Error("O campo idIdoso está incompleto");
    this._id = value;
}

 public static criar(
    nome: string,
    dosagem: string,
    horario: string,
    frequencia: string,
    idIdoso: string,
    observacoes?: string,
  ): Medicamento {
    return new Medicamento(nome, dosagem, horario, frequencia, idIdoso, observacoes);
  }
  
  public static editar(
    
    nome: string,
    dosagem: string,
    horario: string,
    frequencia: string,
    idIdoso: string,
    observacoes?: string,
    id?: string,
): Medicamento {
    return new Medicamento(nome, dosagem, horario, frequencia, idIdoso, observacoes, id);
  }
}