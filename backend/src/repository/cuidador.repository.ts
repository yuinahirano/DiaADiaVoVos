import { db } from "../database/connection.database";
import { ICuidador } from "../models/cuiador.model";
import { ResultSetHeader } from "mysql2";

export class CuidadorRepository {
  async selecionarTodos(): Promise<ICuidador[]> {
    const [rows] = await db.execute<ICuidador[]>("SELECT * FROM cuidador;");
    return rows;
  }
  async selecionarPorId(id: string): Promise<ICuidador[]> {
    const sql = "SELECT * FROM cuidador WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ICuidador[]>(sql, values);
    return rows;
  }
async criar(dados: Omit<ICuidador, "id">): Promise<ResultSetHeader> {
  const sql = `INSERT INTO cuidador 
          (telefone, id_usuario, id_imagem)  
            VALUES (?,?,?);`;
  const values = [
    dados.telefone,
    dados.idUsuario,
    dados.idImagem ?? null,
  ];
  const [rows] = await db.execute<ResultSetHeader>(sql, values);
  return rows;
}

async editar(
  id: string,
  dados: Omit<ICuidador, "id">,
): Promise<ResultSetHeader> {
  console.log(    dados.telefone,
    dados.idUsuario,
    dados.idImagem ?? null,
    id,);
  
  const sql = `UPDATE cuidador SET 
             telefone=?, id_usuario=?, id_imagem=?
              WHERE id=?;`;
  const values = [
    dados.telefone,
    dados.idUsuario,
    dados.idImagem ?? null,
    id,
  ];
  const [rows] = await db.execute<ResultSetHeader>(sql, values);
  return rows;
}

  async deletar(id: string): Promise<ResultSetHeader> {
    const sql = "DELETE FROM cuidador WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }
}
