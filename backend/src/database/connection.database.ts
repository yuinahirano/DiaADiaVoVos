import 'dotenv/config';
import mysql, { Pool, PoolOptions } from 'mysql2/promise';

type Ambiente = 'local' | 'tidb';

// Lê uma variável com prefixo do ambiente, ex.: LOCAL_DB_HOST ou TIDB_DB_HOST
function variavel(prefixo: string, nome: string): string {
    const valor = process.env[`${prefixo}_${nome}`];
    if (!valor) throw new Error(`Variável ${prefixo}_${nome} não definida no .env`);
    return valor;
}

class Database {
    private static instance: Database;
    private pool!: Pool;

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
            Database.instance.createPool();
        }
        return Database.instance;
    }

    private configuracao(ambiente: Ambiente): PoolOptions {
        const prefixo = ambiente.toUpperCase(); // LOCAL ou TIDB

        const base: PoolOptions = {
            host: variavel(prefixo, 'DB_HOST'),
            user: variavel(prefixo, 'DB_USER'),
            password: variavel(prefixo, 'DB_PASSWORD'),
            database: variavel(prefixo, 'DB_DATABASE'),
            port: Number(variavel(prefixo, 'DB_PORT')),
            waitForConnections: true,
            queueLimit: 0,
        };

        if (ambiente === 'tidb') {
            return {
                ...base,
                // TiDB Cloud exige conexão criptografada (TLS)
                ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
                connectTimeout: 20000,
                // O plano gratuito do TiDB tem limite de conexões
                connectionLimit: 10,
            };
        }

        return {
            ...base,
            connectionLimit: 100,
        };
    }

    private createPool(): void {
        const ambiente = (process.env.DB_AMBIENTE ?? 'local').toLowerCase();
        if (ambiente !== 'local' && ambiente !== 'tidb')
            throw new Error("DB_AMBIENTE deve ser 'local' ou 'tidb'");

        const config = this.configuracao(ambiente);
        console.log(`Banco: ${ambiente} -> ${config.host}:${config.port}/${config.database}`);
        this.pool = mysql.createPool(config);
    }

    public getPool(): Pool {
        return this.pool;
    }
}

export const db = Database.getInstance().getPool();