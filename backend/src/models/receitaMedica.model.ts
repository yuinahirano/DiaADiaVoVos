import { RowDataPacket } from "mysql2";

export interface IReceitaMedica extends RowDataPacket {
  id?: string;
  idConsulta: string;
  descricao: string;
  dataEmissao: string;
  dataVencimento?: string;
}

export class ReceitaMedica {
  private _idConsulta!: string;
  private _descricao!: string;
  private _dataEmissao!: string;
  private _id?: string;
  private _dataVencimento?: string;

  constructor(
    idConsulta: string,
    descricao: string,
    dataEmissao: string,
    dataVencimento?: string,
    id?: string,
  ) {
    this._id = id;
    this.IdConsulta = idConsulta;
    this.Descricao = descricao;
    this.DataEmissao = dataEmissao;
    this._dataVencimento = dataVencimento;
  }

  public get Id(): string | undefined {
    return this._id;
  }

  public get IdConsulta(): string {
    return this._idConsulta;
  }

  public get Descricao(): string {
    return this._descricao;
  }

  public get DataEmissao(): string {
    return this._dataEmissao;
  }

  public get DataVencimento(): string | undefined {
    return this._dataVencimento;
  }

  public set Id(value: string) {
    this._validarId(value);
    this._id = value;
  }

  public set IdConsulta(value: string) {
    this._validarIdConsulta(value);
    this._idConsulta = value;
  }

  public set Descricao(value: string) {
    this._validarDescricao(value);
    this._descricao = value;
  }

  public set DataEmissao(value: string) {
    this._validarData(value);
    this._dataEmissao = value;
  }

  public set DataVencimento(value: string) {
    this._validarData(value);
    this._dataVencimento = value;
  }

  private _validarId(value: string): void {
    if (!value || value.trim().length < 3) {
      throw new Error("O campo id está incompleto");
    }
  }

  private _validarIdConsulta(value: string): void {
    if (!value || value.trim().length < 3) {
      throw new Error("O campo idConsulta está incompleto");
    }
  }

  private _validarDescricao(value: string): void {
    if (!value || value.trim().length < 3) {
      throw new Error("O campo descricao está incompleto");
    }
  }

  private _validarData(value: string): void {
    if (!value || value.trim().length < 3) {
      throw new Error("O campo data está incompleto");
    }
  }

  public static criar(
    idConsulta: string,
    descricao: string,
    dataEmissao: string,
    dataVencimento?: string,
  ): ReceitaMedica {
    return new ReceitaMedica(
      idConsulta,
      descricao,
      dataEmissao,
      dataVencimento,
    );
  }

  public static editar(
    id: string,
    idConsulta: string,
    descricao: string,
    dataEmissao: string,
    dataVencimento?: string,
  ): ReceitaMedica {
    return new ReceitaMedica(
      idConsulta,
      descricao,
      dataEmissao,
      dataVencimento,
      id,
    );
  }
}
