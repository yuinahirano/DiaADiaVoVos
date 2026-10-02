import { db } from "../database/connection.database";
import { ILeitura } from "../models/leitura.model";
import { ResultSetHeader } from "mysql2";

export class LeituraRepository {
  async selecionarTodos(): Promise<ILeitura[]> {
    const [rows] = await db.execute<ILeitura[]>("SELECT * FROM leitura;");
    return rows;
  }

  async selecionarPorId(id: string): Promise<ILeitura[]> {
    const sql = "SELECT * FROM leitura WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ILeitura[]>(sql, values);
    return rows;
  }

  async criar(dados: Omit<ILeitura, "id">): Promise<ResultSetHeader> {
    const sql = `INSERT INTO leitura 
            (id_pulseira, bpm, spo2)  
              VALUES (?,?,?);`;
    const values = [
      dados.idPulseira,
      dados.bpm,
      dados.spo2,
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async editar(
    id: string,
    dados: Omit<ILeitura, "id">,
  ): Promise<ResultSetHeader> {
    const sql = `UPDATE leitura SET 
               id_pulseira=?, bpm=?, spo2=?
                WHERE id=?;`;
    const values = [
      dados.idPulseira,
      dados.bpm,
      dados.spo2,
      id,
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async deletar(id: string): Promise<ResultSetHeader> {
    const sql = "DELETE FROM leitura WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }
}