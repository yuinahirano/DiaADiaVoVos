import { db } from "../database/connection.database";
import { ISolicitacaoPulseira, SolicitacaoPulseira } from "../models/solicitacaoPulseira.model";
import { ResultSetHeader } from "mysql2";

export class SolicitacaoPulseiraRepository {
  async selecionarTodos(): Promise<ISolicitacaoPulseira[]> {
    const [rows] = await db.execute<ISolicitacaoPulseira[]>("SELECT * FROM solicitacao_pulseira;");
    return rows;
  }

  async selecionarPorId(id: string): Promise<ISolicitacaoPulseira[]> {
    const sql = "SELECT * FROM solicitacao_pulseira WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ISolicitacaoPulseira[]>(sql, values);
    return rows;
  }

  async selecionarPorIdoso(idIdoso: string): Promise<ISolicitacaoPulseira[]> {
    const sql = "SELECT * FROM solicitacao_pulseira WHERE id_idoso=?;";
    const values = [idIdoso];
    const [rows] = await db.execute<ISolicitacaoPulseira[]>(sql, values);
    return rows;
  }

  async selecionarPorCuidador(idCuidador: string): Promise<ISolicitacaoPulseira[]> {
    const sql = "SELECT * FROM solicitacao_pulseira WHERE id_cuidador=?;";
    const values = [idCuidador];
    const [rows] = await db.execute<ISolicitacaoPulseira[]>(sql, values);
    return rows;
  }

  // O id não entra no INSERT: o banco gera (DEFAULT UUID())
  async criar(dados: Omit<ISolicitacaoPulseira, "id">): Promise<ResultSetHeader> {
    const sql = `INSERT INTO solicitacao_pulseira 
    (id_idoso, id_cuidador, nome, intervalo_leitura_seg, status, expira_em)  
      VALUES (?,?,?,?,?,?);`;
    const values = [
      dados.idIdoso,
      dados.idCuidador,
      dados.nome,
      dados.intervaloLeituraSeg ?? null,
      dados.status,
      dados.expiraEm,
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async editar(id: string, dados: Omit<ISolicitacaoPulseira, "id">): Promise<ResultSetHeader> {
    const sql = `UPDATE solicitacao_pulseira SET 
      id_idoso=?, id_cuidador=?, nome=?, intervalo_leitura_seg=?, status=?, expira_em=? 
      WHERE id=?;`;
    const values = [
      dados.idIdoso,
      dados.idCuidador,
      dados.nome,
      dados.intervaloLeituraSeg ?? null,
      dados.status,
      dados.expiraEm,
      id,
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async deletar(id: string): Promise<ResultSetHeader> {
    const sql = "DELETE FROM solicitacao_pulseira WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async deletarPorIdoso(idIdoso: string): Promise<ResultSetHeader> {
    const sql = "DELETE FROM solicitacao_pulseira WHERE id_idoso=?;";
    const values = [idIdoso];

    const [rows] = await db.execute<ResultSetHeader>(sql, values);

    return rows;
  }

  async aceitar(id: string): Promise<ResultSetHeader> {
    const [dados] = await this.selecionarPorId(id);
    if (!dados) throw new Error("Solicitação não encontrada");

    const row = dados as any;
    const solicitacao = SolicitacaoPulseira.editar(
      row.id,
      row.id_idoso,
      row.id_cuidador,
      row.nome,
      row.intervalo_leitura_seg,
      row.status,
      new Date(row.expira_em)
    );

    solicitacao.aceitar();

    const sql = "UPDATE solicitacao_pulseira SET status=? WHERE id=?;";
    const values = [solicitacao.Status, id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  // Usado só se a criação da pulseira falhar depois do aceite
  async voltarParaPendente(id: string): Promise<ResultSetHeader> {
    const sql = "UPDATE solicitacao_pulseira SET status='PENDENTE' WHERE id=?;";
    const [rows] = await db.execute<ResultSetHeader>(sql, [id]);
    return rows;
  }

  async recusar(id: string): Promise<ResultSetHeader> {
    const [dados] = await this.selecionarPorId(id);
    if (!dados) throw new Error("Solicitação não encontrada");

    const row = dados as any;
    const solicitacao = SolicitacaoPulseira.editar(
      row.id,
      row.id_idoso,
      row.id_cuidador,
      row.nome,
      row.intervalo_leitura_seg,
      row.status,
      new Date(row.expira_em)
    );

    solicitacao.recusar();

    const sql = "UPDATE solicitacao_pulseira SET status=? WHERE id=?;";
    const values = [solicitacao.Status, id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async cancelar(id: string): Promise<ResultSetHeader> {
    const [dados] = await this.selecionarPorId(id);
    if (!dados) throw new Error("Solicitação não encontrada");

    const row = dados as any;
    const solicitacao = SolicitacaoPulseira.editar(
      row.id,
      row.id_idoso,
      row.id_cuidador,
      row.nome,
      row.intervalo_leitura_seg,
      row.status,
      new Date(row.expira_em)
    );

    solicitacao.cancelar();

    const sql = "UPDATE solicitacao_pulseira SET status=? WHERE id=?;";
    const values = [solicitacao.Status, id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }
}