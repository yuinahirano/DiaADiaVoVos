import { db } from "../database/connection.database";
import { IUsuario } from "../models/usuario.model";
import { ResultSetHeader } from "mysql2";

export class UsuarioRepository {

  async selecionarTodos(): Promise<IUsuario[]> {
    const [rows] = await db.execute<IUsuario[]>(
      "SELECT * FROM usuario;"
    );
    return rows;
  }

  async selecionarPorId(id: string): Promise<IUsuario[]> {
const sql = `
SELECT
  u.*,
  i.id AS idIdoso,
  c.id AS idCuidador,
  CASE
    WHEN i.id IS NOT NULL THEN 'idoso'
    WHEN c.id IS NOT NULL THEN 'cuidador'
    ELSE NULL
  END AS role
FROM usuario u
LEFT JOIN idoso i ON i.id_usuario = u.id
LEFT JOIN cuidador c ON c.id_usuario = u.id
WHERE u.id = ?;
  `;
    const values = [id];
    const [rows] = await db.execute<IUsuario[]>(sql, values);
    return rows;
  }

  async selecionarPorEmail(email: string): Promise<IUsuario[]> {
    const sql = "SELECT * FROM usuario WHERE email=?;";
    const values = [email];
    const [rows] = await db.execute<IUsuario[]>(sql, values);
    return rows;
  }

  async selecionarPorCpf(cpf: string): Promise<IUsuario[]> {
    const sql = "SELECT * FROM usuario WHERE cpf=?;";
    const values = [cpf];
    const [rows] = await db.execute<IUsuario[]>(sql, values);
    return rows;
  }

  async criar(dados: Omit<IUsuario, "id">): Promise<ResultSetHeader> {
    const sql = `INSERT INTO usuario 
    (nome, cpf, email, senha, data_nascimento, estado_civil)  
      VALUES (?,?,?,?,?,?);`;
    const values = [
      dados.nome,
      dados.cpf,
      dados.email,
      dados.senha,
      dados.dataNascimento,
      dados.estadoCivil,
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async editar(id: string, dados: Omit<IUsuario, "id">): Promise<ResultSetHeader> {
    const sql = `UPDATE usuario SET 
      nome=?, cpf=?, email=?, senha=?, data_nascimento=?, estado_civil=? 
      WHERE id=?;`;
    const values = [
      dados.nome,
      dados.cpf,
      dados.email,
      dados.senha,
      dados.dataNascimento,
      dados.estadoCivil,
      id,
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async deletar(id: string): Promise<ResultSetHeader> {
    const sql = "DELETE FROM usuario WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }
}