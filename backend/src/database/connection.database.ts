import 'dotenv/config';
import mysql, { Pool, PoolOptions } from 'mysql2/promise';

type Ambiente = 'local' | 'tidb';

class Database {
    private static instance: Database;
    private pool!: Pool;

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }

        return Database.instance;
    }

    private configuracao(ambiente: Ambiente): PoolOptions {
        const prefixo = ambiente.toUpperCase();

        const variavel = (nome: string): string => {
            const valor = process.env[`${prefixo}_DB_${nome}`];

            if (!valor) {
                throw new Error(
                    `Variável ${prefixo}_DB_${nome} não definida no .env`
                );
            }

            return valor;
        };

        const config: PoolOptions = {
            host: variavel('HOST'),
            user: variavel('USER'),
            password: variavel('PASSWORD'),
            database: variavel('DATABASE'),
            port: Number(variavel('PORT')),
            waitForConnections: true,
            queueLimit: 0,
            connectionLimit: ambiente === 'tidb' ? 10 : 100,
            connectTimeout: 10000,
        };

        if (ambiente === 'tidb') {
            config.ssl = {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: true,
            };
        }

        return config;
    }

    private async testarConexao(pool: Pool): Promise<void> {
        const conexao = await pool.getConnection();

        try {
            await conexao.query('SELECT 1');
        } finally {
            conexao.release();
        }
    }

    public async conectar(): Promise<Pool> {
        // 1. Tenta conectar ao TiDB primeiro.
        try {
            console.log('Tentando conectar ao TiDB Cloud...');

            const poolTiDB = mysql.createPool(
                this.configuracao('tidb')
            );

            try {
                await this.testarConexao(poolTiDB);

                this.pool = poolTiDB;

                console.log('Conectado ao TiDB Cloud com sucesso!');

                return this.pool;
            } catch (erro) {
                await poolTiDB.end();
                throw erro;
            }
        } catch (erro) {
            console.error(
                'Não foi possível conectar ao TiDB Cloud.'
            );

            console.error(
                erro instanceof Error ? erro.message : erro
            );
        }

        // 2. Se o TiDB falhar, tenta o banco local.
        try {
            console.log('Tentando conectar ao banco local...');

            const poolLocal = mysql.createPool(
                this.configuracao('local')
            );

            try {
                await this.testarConexao(poolLocal);

                this.pool = poolLocal;

                console.log('Conectado ao banco local com sucesso!');

                return this.pool;
            } catch (erro) {
                await poolLocal.end();
                throw erro;
            }
        } catch (erro) {
            console.error(
                'Não foi possível conectar ao banco local.'
            );

            throw new Error(
                'Falha ao conectar ao TiDB Cloud e ao banco local.'
            );
        }
    }

    public getPool(): Pool {
        if (!this.pool) {
            throw new Error(
                'Banco de dados não inicializado. Chame conectar() primeiro.'
            );
        }

        return this.pool;
    }
}

export const database = Database.getInstance();

// Será preenchido depois que a conexão for testada.
export let db: Pool;

export async function inicializarBanco(): Promise<void> {
    db = await database.conectar();
}