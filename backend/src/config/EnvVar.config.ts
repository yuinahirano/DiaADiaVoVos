import 'dotenv/config';
import { EnvKey } from './enum/EnvKey';

export class EnvVar {
    private constructor() { };

    public static getString(chave: EnvKey): string {
        const valor = process.env[chave];
        if (valor === undefined) {
            throw new Error(`Variável ${chave} não definida no .env`);
        }
        return valor;
    }

    public static getNumber(chave: EnvKey): number {
        const valor = this.getString(chave);
        const valorConvertido = Number(valor);

        if (isNaN(valorConvertido)) {
            throw new Error(`Variável ${chave} deve ser um número válido`);
        }
        return valorConvertido;
    }

    public static getBoolean(chave: EnvKey): boolean {
        const valor = this.getString(chave).toLowerCase();
        return ['true', '1', 'yes', 'on'].includes(valor);
    }

    public static get SERVER_PORT():number{
        return this.getNumber(EnvKey.SERVER_PORT);
    }
    public static get DB_HOST():string{
        return this.getString(EnvKey.DB_HOST);
    }
    public static get DB_USER():string{
        return this.getString(EnvKey.DB_USER);
    }
    public static get DB_PASSWORD():string{
        return this.getString(EnvKey.DB_PASSWORD);
    }
    public static get DB_PORT():number{
        return this.getNumber(EnvKey.DB_PORT);
    }
    public static get DB_DATABASE():string{
        return this.getString(EnvKey.DB_DATABASE);
    }
}