import mysql, { Pool } from 'mysql2/promise';
import { EnvVar } from '../config/EnvVar.config';

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

    private createPool(): void {
        this.pool = mysql.createPool({
            host: EnvVar.DB_HOST,
            user: EnvVar.DB_USER,
            password: EnvVar.DB_PASSWORD,
            database: EnvVar.DB_DATABASE,
            port: EnvVar.DB_PORT,
            //ssl: { rejectUnauthorized: true },
            waitForConnections: true,
            connectionLimit: 100,
            queueLimit: 0
        });
    }

    public getPool(): Pool {
        return this.pool;
    }
}

export const db = Database.getInstance().getPool();