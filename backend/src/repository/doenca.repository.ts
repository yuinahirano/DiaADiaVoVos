import { db } from "../database/connection.database";
import { IDoenca } from "../models/doenca.model";
import { ResultSetHeader } from "mysql2";

export class DoencaRepository {
  async selecionarTodos(): Promise<IDoenca[]> {
    const [rows] = await db.execute<IDoenca[]>("SELECT * FROM doenca;");
    return rows;
  }

  async selecionarPorId(id: string): Promise<IDoenca[]> {
    const sql = "SELECT * FROM doenca WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<IDoenca[]>(sql, values);
    return rows;
  }

  async criar(dados: Omit<IDoenca, "id">): Promise<ResultSetHeader> {
    console.log(dados);
    
    const sql = `INSERT INTO doenca 
            (nome, descricao, id_idoso)  
              VALUES (?,?,?);`;
    const values = [
      dados.nome,
      dados.descricao,
      dados.idIdoso
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async editar(
    id: string,
    dados: Omit<IDoenca, "id">,
  ): Promise<ResultSetHeader> {
    const sql = `UPDATE doenca SET 
               nome=?, descricao=?, id_idoso=?
                WHERE id=?;`;
    const values = [
      dados.nome,
      dados.descricao,
      dados.idIdoso,
      id
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async deletar(id: string): Promise<ResultSetHeader> {
    const sql = "DELETE FROM doenca WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }
}