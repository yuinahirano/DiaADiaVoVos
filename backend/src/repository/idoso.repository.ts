import { db } from "../database/connection.database";
import { IIdoso } from "../models/idoso.model";
import { ResultSetHeader } from "mysql2";

export class IdosoRepository {
  async selecionarTodos(): Promise<IIdoso[]> {
    const [rows] = await db.execute<IIdoso[]>("SELECT * FROM idoso;");
    return rows;
  }
  async selecionarPorId(id: string): Promise<IIdoso[]> {
    const sql = "SELECT * FROM idoso WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<IIdoso[]>(sql, values);
    return rows;
  }
async criar(dados: Omit<IIdoso, "id">): Promise<ResultSetHeader> {
  const sql = `INSERT INTO idoso 
          (tipo_sanguineo, telefone, pcd, id_usuario, id_imagem)  
            VALUES (?,?,?,?,?);`;
  const values = [
    dados.tipoSanguineo,
    dados.telefone,
    dados.pcd,
    dados.idUsuario,
    dados.idImagem ?? null,
  ];
  const [rows] = await db.execute<ResultSetHeader>(sql, values);
  return rows;
}

async editar(
  id: string,
  dados: Omit<IIdoso, "id">,
): Promise<ResultSetHeader> {
  const sql = `UPDATE idoso SET 
              tipo_sanguineo=?, telefone=?, pcd=?, id_usuario=?, id_imagem=?
              WHERE id=?;`;
  const values = [
    dados.tipoSanguineo,
    dados.telefone,
    dados.pcd,
    dados.idUsuario,
    dados.idImagem ?? null,
    id,
  ];
  const [rows] = await db.execute<ResultSetHeader>(sql, values);
  return rows;
}

  async deletar(id: string): Promise<ResultSetHeader> {
    const sql = "DELETE FROM idoso WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }
}
