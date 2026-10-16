import { db } from "../database/connection.database";
import { IIdosoCuidador } from "../models/idosoCuidador.model";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export interface IIdosoVinculado extends RowDataPacket {
  id: number | string;
  id_usuario: number | string;
  id_vinculo: number | string;
  nome: string;
  contato_emergencia: string;
}

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

  async selecionarPorIdosoECuidador(
    idIdoso: string,
    idCuidador: string,
  ): Promise<IIdosoCuidador[]> {
    const sql =
      "SELECT * FROM idoso_cuidador WHERE id_idoso=? AND id_cuidador=?;";
    const values = [idIdoso, idCuidador];
    const [rows] = await db.execute<IIdosoCuidador[]>(sql, values);
    return rows;
  }

  async selecionarIdososPorCuidador(
    idCuidador: string,
  ): Promise<IIdosoVinculado[]> {
    const sql = `SELECT 
                   i.id AS id,
                   i.id_usuario AS id_usuario,
                   ic.id AS id_vinculo,
                   u.nome AS nome,
                   ic.contato_emergencia AS contato_emergencia
                 FROM idoso_cuidador ic
                 INNER JOIN idoso i ON i.id = ic.id_idoso
                 INNER JOIN usuario u ON u.id = i.id_usuario
                 WHERE ic.id_cuidador = ?;`;
    const values = [idCuidador];
    const [rows] = await db.execute<IIdosoVinculado[]>(sql, values);
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