import { db } from "../database/connection.database";
import { IPulseira } from "../models/pulseira.model";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export class PulseiraRepository {
  async selecionarTodos(): Promise<IPulseira[]> {
    const sql =
      "SELECT id, id_cuidador, id_idoso, nome, vinculada_em FROM pulseira;";
    const [rows] = await db.execute<IPulseira[]>(sql);
    return rows;
  }

  async selecionarPorId(id: string): Promise<IPulseira[]> {
    const sql =
      "SELECT id, id_cuidador, id_idoso, nome, vinculada_em FROM pulseira WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<IPulseira[]>(sql, values);
    return rows;
  }

  // Uso interno (middleware do dispositivo): precisa do SELECT * por causa do token
  async selecionarPorToken(token: string): Promise<IPulseira[]> {
    const sql = "SELECT * FROM pulseira WHERE device_token=?;";
    const [rows] = await db.execute<IPulseira[]>(sql, [token]);
    return rows;
  }

  async selecionarStatus(id: string): Promise<RowDataPacket[]> {
    const sql = `
      SELECT p.id, p.vinculada_em,
             MAX(l.medido_em) AS ultima_leitura,
             TIMESTAMPDIFF(SECOND, MAX(l.medido_em), NOW()) AS segundos_desde_ultima
      FROM pulseira p
      LEFT JOIN leitura l ON l.id_pulseira = p.id
      WHERE p.id=?
      GROUP BY p.id, p.vinculada_em;`;
    const [rows] = await db.execute<RowDataPacket[]>(sql, [id]);
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

  async vincular(id: string, token: string): Promise<ResultSetHeader> {
    const sql = `UPDATE pulseira SET device_token=?, vinculada_em=NOW() WHERE id=?;`;
    const [rows] = await db.execute<ResultSetHeader>(sql, [token, id]);
    return rows;
  }

  async deletar(id: string): Promise<ResultSetHeader> {
    const sql = "DELETE FROM pulseira WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }
}