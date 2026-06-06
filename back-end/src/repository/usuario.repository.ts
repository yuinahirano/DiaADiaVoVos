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

  async selecionarPorId(id: number): Promise<IUsuario[]> {
    const sql = "SELECT * FROM usuario WHERE id=?;";
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
      (nome, cpf, email, senha, dataNascimento, estadoCivil) 
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

  async editar(id: number, dados: Omit<IUsuario, "id">): Promise<ResultSetHeader> {
    const sql = `UPDATE usuario SET 
      nome=?, cpf=?, email=?, senha=?, dataNascimento=?, estadoCivil=? 
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

  async deletar(id: number): Promise<ResultSetHeader> {
    const sql = "DELETE FROM usuario WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }
}