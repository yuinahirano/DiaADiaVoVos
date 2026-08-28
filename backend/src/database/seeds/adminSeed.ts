import 'dotenv/config';
import bcrypt from 'bcrypt';
import { db } from '../connection.database';

async function seedAdmin(): Promise<void> {
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
        console.error('ADMIN_PASSWORD não definida no .env');
        process.exit(1);
    }

    const senhaHash = await bcrypt.hash(password, 10);

    const query = `
        INSERT INTO admin (nome, email, senha)
        VALUES (?, ?, ?)
    `;

    try {
        await db.execute(query, [
            'Admin',
            'admin@email.com',
            senhaHash
        ]);
        console.log('Admin criado com sucesso!');
    } catch (err) {
        console.error('Erro ao criar admin:', err);
    } finally {
        process.exit();
    }
}

seedAdmin();