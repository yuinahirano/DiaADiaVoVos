import { RowDataPacket } from "mysql2";
import { EmailUtils } from "../utils/validarEmail.utils";

export interface IAdmin extends RowDataPacket {
    id?: string;
    nome: string;
    email: string;
    senha: string;
}

export class Admin {
    private _id?: string;
    private _nome!: string;
    private _email!: string;
    private _senha!: string;

    constructor(
        nome: string,
        email: string,
        senha: string,
        id?: string
    ) {
        this._id = id;
        this.Nome = nome;
        this.Email = email;
        this.Senha = senha;
    }

    public get Id(): string | undefined {
        return this._id;
    }

    public get Nome(): string {
        return this._nome;
    }
    public set Nome(value: string) {
        this._nome = value;
    }

    public get Email(): string {
        return this._email;
    }
    public set Email(value: string) {
        EmailUtils.validar(value);
        this._email = value;
    }

    public get Senha(): string {
        return this._senha;
    }
    public set Senha(value: string) {
        this._senha = value;
    }

    public static criar(
        nome: string,
        email: string,
        senha: string
    ): Admin {
        return new Admin(nome, email, senha);
    }

    public static editar(
        nome: string,
        email: string,
        senha: string,
        id: string
    ): Admin {
        return new Admin(nome, email, senha, id);
    }
}