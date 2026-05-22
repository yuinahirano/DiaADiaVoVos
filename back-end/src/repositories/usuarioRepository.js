import { connection } from "../configs/Database.js";

const usuarioRepository = {

    criar: async (usuario, endereco) => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();

            const sqlUsuario = 'INSERT INTO usuario (nome, cpf, email, senha, data_nascimento, estado_civil) VALUES (?, ?, ?, ?, ?, ?);';
            const valuesUsuario = [usuario.nome, usuario.cpf, usuario.email, usuario.senha, usuario.dataNascimento, usuario.estadoCivil]; 
            const [rowsUsuario] = await conn.execute(sqlUsuario, valuesUsuario);

            const sqlEndereco = 'INSERT INTO enderecos (id_usuario, logradouro, numero, complemento, bairro, cidade, uf, cep) VALUES (?, ?, ?, ?, ?, ?, ?, ?);';
            const valuesEndereco = [rowsUsuario.insertId, endereco.logradouro, endereco.numero, endereco.complemento, endereco.bairro, endereco.cidade, endereco.uf, endereco.cep];
            const [rowsEndereco] = await conn.execute(sqlEndereco, valuesEndereco);

            await conn.commit();
            return { rowsUsuario, rowsEndereco };
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    atualizar: async (usuario, endereco) => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();

            const sqlUsuario = 'UPDATE usuario SET nome = ?, cpf = ?, email = ?, senha = ?, data_nascimento = ?, estado_civil = ? WHERE id = ?;';
            const valuesUsuario = [usuario.nome, usuario.cpf, usuario.email, usuario.senha, usuario.dataNascimento, usuario.estadoCivil, usuario.id];
            const [rowsUsuario] = await conn.execute(sqlUsuario, valuesUsuario);

            const sqlEndereco = 'UPDATE enderecos SET logradouro = ?, numero = ?, complemento = ?, bairro = ?, cidade = ?, uf = ?, cep = ? WHERE id_usuario = ?;'; 
            const valuesEndereco = [endereco.logradouro, endereco.numero, endereco.complemento, endereco.bairro, endereco.cidade, endereco.uf, endereco.cep, usuario.id];
            const [rowsEndereco] = await conn.execute(sqlEndereco, valuesEndereco);

            await conn.commit();
            return { rowsUsuario, rowsEndereco };
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    selecionar: async () => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();

            const [rows] = await conn.execute(`
                SELECT 
                    usuario.*, 
                    enderecos.*
                FROM usuario   
                LEFT JOIN enderecos ON usuario.id = enderecos.id_usuario
            `);

            await conn.commit();
            return rows;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    deletar: async (id) => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();

            await conn.execute("DELETE FROM enderecos WHERE id_usuario = ?", [id]);
            await conn.execute("DELETE FROM usuario WHERE id = ?", [id]);

            await conn.commit();
            return { message: "usuario deletado com sucesso" };
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
};

export default usuarioRepository;