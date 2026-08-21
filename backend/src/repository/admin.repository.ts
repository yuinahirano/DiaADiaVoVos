import { db } from "../database/connection.database";
import { IAdmin } from "../models/admin.model";
import { ResultSetHeader } from "mysql2";

export class AdminRepository {
  async selecionarTodos(): Promise<IAdmin[]> {
    const [rows] = await db.execute<IAdmin[]>("SELECT * FROM admin;");
    return rows;
  }
  async selecionarPorId(id: string): Promise<IAdmin[]> {
    const sql = "SELECT * FROM admin WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<IAdmin[]>(sql, values);
    return rows;
  }
  async selecionarPorEmail(id: string): Promise<IAdmin[]> {
    const sql = "SELECT * FROM admin WHERE email=?;";
    const values = [id];
    const [rows] = await db.execute<IAdmin[]>(sql, values);
    return rows;
  }
async criar(dados: Omit<IAdmin, "id">): Promise<ResultSetHeader> {
  const sql = `INSERT INTO admin (nome, email, senha)
        VALUES (?, ?, ?)`;
  const values = [
    dados.nome,
    dados.email,
    dados.senha,

  ];
  const [rows] = await db.execute<ResultSetHeader>(sql, values);
  return rows;
}

async editar(
  id: string,
  dados: Omit<IAdmin, "id">,
): Promise<ResultSetHeader> {
  console.log(    dados.nomeMedico,
    dados.horario,
    dados.localadmin,
    dados.idIdoso,
    id,);
  const sql = `UPDATE admin SET 
             nome=?, email=?, senha=? 
              WHERE id=?;`;
  const values = [
    dados.nome,
    dados.email,
    dados.senha,
    id,
  ];
  const [rows] = await db.execute<ResultSetHeader>(sql, values);
  return rows;
}

  async deletar(id: string): Promise<ResultSetHeader> {
    const sql = "DELETE FROM admin WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }
}
