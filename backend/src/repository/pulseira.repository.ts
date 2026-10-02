import { db } from "../database/connection.database";
import { IPulseira } from "../models/pulseira.model";
import { ResultSetHeader } from "mysql2";

export class PulseiraRepository {
  async selecionarTodos(): Promise<IPulseira[]> {
    const [rows] = await db.execute<IPulseira[]>("SELECT * FROM pulseira;");
    return rows;
  }

  async selecionarPorId(id: string): Promise<IPulseira[]> {
    const sql = "SELECT * FROM pulseira WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<IPulseira[]>(sql, values);
    return rows;
  }

  async criar(dados: Omit<IPulseira, "id">): Promise<ResultSetHeader> {
    const sql = `INSERT INTO pulseira 
            (id_cuidador, id_idoso, nome)  
              VALUES (?,?,?);`;
    const values = [
      dados.idCuidador,
      dados.idIdoso,
      dados.nome,
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async editar(
    id: string,
    dados: Omit<IPulseira, "id">,
  ): Promise<ResultSetHeader> {
    const sql = `UPDATE pulseira SET 
               id_cuidador=?, id_idoso=?, nome=?
                WHERE id=?;`;
    const values = [
      dados.idCuidador,
      dados.idIdoso,
      dados.nome,
      id,
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async deletar(id: string): Promise<ResultSetHeader> {
    const sql = "DELETE FROM pulseira WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }
}