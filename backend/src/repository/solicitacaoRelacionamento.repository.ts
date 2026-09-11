import { db } from "../database/connection.database";
import { ISolicitacaoCuidador, SolicitacaoCuidador } from "../models/solicitacaoRelacionamento.model";
import { ResultSetHeader } from "mysql2";

export class SolicitacaoCuidadorRepository {
  async selecionarTodos(): Promise<ISolicitacaoCuidador[]> {
    const [rows] = await db.execute<ISolicitacaoCuidador[]>("SELECT * FROM solicitacao_cuidador;");
    return rows;
  }

  async selecionarPorId(id: string): Promise<ISolicitacaoCuidador[]> {
    const sql = "SELECT * FROM solicitacao_cuidador WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ISolicitacaoCuidador[]>(sql, values);
    return rows;
  }

  async selecionarPorIdoso(idIdoso: string): Promise<ISolicitacaoCuidador[]> {
    const sql = "SELECT * FROM solicitacao_cuidador WHERE id_idoso=?;";
    const values = [idIdoso];
    const [rows] = await db.execute<ISolicitacaoCuidador[]>(sql, values);
    return rows;
  }

  async selecionarPorCuidador(idCuidador: string): Promise<ISolicitacaoCuidador[]> {
    const sql = "SELECT * FROM solicitacao_cuidador WHERE id_cuidador=?;";
    const values = [idCuidador];
    const [rows] = await db.execute<ISolicitacaoCuidador[]>(sql, values);
    return rows;
  }

  async criar(dados: Omit<ISolicitacaoCuidador, "id">): Promise<ResultSetHeader> {
    const sql = `INSERT INTO solicitacao_cuidador 
    (id_idoso, id_cuidador, status, expira_em)  
      VALUES (?,?,?,?);`;
    const values = [
      dados.idIdoso,
      dados.idCuidador,
      dados.status,
      dados.expiraEm,
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async editar(id: string, dados: Omit<ISolicitacaoCuidador, "id">): Promise<ResultSetHeader> {
    const sql = `UPDATE solicitacao_cuidador SET 
      id_idoso=?, id_cuidador=?, status=?, expira_em=? 
      WHERE id=?;`;
    const values = [
      dados.idIdoso,
      dados.idCuidador,
      dados.status,
      dados.expiraEm,
      id,
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async deletar(id: string): Promise<ResultSetHeader> {
    const sql = "DELETE FROM solicitacao_cuidador WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async aceitar(id: string): Promise<ResultSetHeader> {
    const [dados] = await this.selecionarPorId(id);
    if (!dados) throw new Error("Solicitação não encontrada");

    const row = dados as any;
    const solicitacao = SolicitacaoCuidador.editar(
      row.id,
      row.id_idoso,
      row.id_cuidador,
      row.status,
      new Date(row.expira_em)
    );

    solicitacao.aceitar();

    const sql = "UPDATE solicitacao_cuidador SET status=? WHERE id=?;";
    const values = [solicitacao.Status, id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async recusar(id: string): Promise<ResultSetHeader> {
    const [dados] = await this.selecionarPorId(id);
    if (!dados) throw new Error("Solicitação não encontrada");

    const row = dados as any;
    const solicitacao = SolicitacaoCuidador.editar(
      row.id,
      row.id_idoso,
      row.id_cuidador,
      row.status,
      new Date(row.expira_em)
    );

    solicitacao.recusar();

    const sql = "UPDATE solicitacao_cuidador SET status=? WHERE id=?;";
    const values = [solicitacao.Status, id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async cancelar(id: string): Promise<ResultSetHeader> {
    const [dados] = await this.selecionarPorId(id);
    if (!dados) throw new Error("Solicitação não encontrada");

    const row = dados as any;
    const solicitacao = SolicitacaoCuidador.editar(
      row.id,
      row.id_idoso,
      row.id_cuidador,
      row.status,
      new Date(row.expira_em)
    );

    solicitacao.cancelar();

    const sql = "UPDATE solicitacao_cuidador SET status=? WHERE id=?;";
    const values = [solicitacao.Status, id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }
}