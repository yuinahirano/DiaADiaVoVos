import { db } from "../database/connection.database";
import { IIdosoCuidador } from "../models/idosoCuidador.model";
import { ResultSetHeader } from "mysql2";

export class IdosoCuidadorRepository {
  async selecionarTodos(): Promise<IIdosoCuidador[]> {
    const [rows] = await db.execute<IIdosoCuidador[]>("SELECT * FROM idoso_cuidador;");
    return rows;
  }

  async selecionarPorId(id: string): Promise<IIdosoCuidador[]> {
    const sql = "SELECT * FROM idoso_cuidador WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<IIdosoCuidador[]>(sql, values);
    return rows;
  }

  async criar(dados: Omit<IIdosoCuidador, "id">): Promise<ResultSetHeader> {
    const sql = `INSERT INTO idoso_cuidador 
            (id_idoso, id_cuidador, contato_emergencia)  
              VALUES (?,?,?);`;
    const values = [
      dados.idIdoso,
      dados.idCuidador,
      dados.telefoneEmergencia
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async editar(
    id: string,
    dados: Omit<IIdosoCuidador, "id">,
  ): Promise<ResultSetHeader> {
    const sql = `UPDATE idoso_cuidador SET 
               id_idoso=?, id_cuidador=?, contato_emergencia=?
                WHERE id=?;`;
    const values = [
      dados.idIdoso,
      dados.idCuidador,
      dados.telefoneEmergencia,
      id
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async deletar(id: string): Promise<ResultSetHeader> {
    const sql = "DELETE FROM idoso_cuidador WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }
}