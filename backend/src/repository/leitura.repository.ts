import { db } from "../database/connection.database";
import { ILeitura, ILeituraLote } from "../models/leitura.model";
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

  // Inserção em lote, usada pelo app depois de sincronizar com a pulseira.
  // db.query em vez de db.execute: o SQL muda de tamanho a cada lote,
  // então não faz sentido criar um prepared statement para cada formato.
  // INSERT IGNORE + chave única (id_pulseira, medido_em) descarta duplicadas.
  // FROM_UNIXTIME não depende do fuso do Node nem da opção timezone do pool.
  // Retorna quantas linhas realmente entraram (duplicadas não contam).
  async criarLote(
    idPulseira: string,
    leituras: ILeituraLote[],
  ): Promise<number> {
    if (leituras.length === 0) return 0;

    const linhas = leituras.map(() => "(?, FROM_UNIXTIME(?), ?, ?)").join(", ");
    const sql = `INSERT IGNORE INTO leitura (id_pulseira, medido_em, bpm, spo2) VALUES ${linhas};`;
    const values = leituras.flatMap((l) => [
      idPulseira,
      l.medidoEmSegundos,
      l.bpm,
      l.spo2,
    ]);
    const [result] = await db.query<ResultSetHeader>(sql, values);
    return result.affectedRows;
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