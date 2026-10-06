import { db } from "../database/connection.database";
import { IPulseira, INTERVALO_PADRAO_SEG } from "../models/pulseira.model";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export class PulseiraRepository {
  async selecionarTodos(): Promise<IPulseira[]> {
    const sql = `
      SELECT id,
             id_cuidador AS idCuidador,
             id_idoso AS idIdoso,
             nome,
             intervalo_leitura_seg AS intervaloLeituraSeg,
             vinculada_em AS vinculadaEm
      FROM pulseira;`;
    const [rows] = await db.execute<IPulseira[]>(sql);
    return rows;
  }

  // NOVO: pulseiras do usuário (id da tabela usuario) como cuidador ou como idoso.
  // pulseira.id_cuidador e pulseira.id_idoso apontam para cuidador.id e idoso.id,
  // por isso o JOIN até usuario (id_usuario) antes de comparar.
  async selecionarPorUsuario(idUsuario: string): Promise<IPulseira[]> {
    const sql = `
      SELECT DISTINCT p.id,
             p.id_cuidador AS idCuidador,
             p.id_idoso AS idIdoso,
             p.nome,
             p.intervalo_leitura_seg AS intervaloLeituraSeg,
             p.vinculada_em AS vinculadaEm
      FROM pulseira p
      LEFT JOIN cuidador c ON c.id = p.id_cuidador
      LEFT JOIN idoso i ON i.id = p.id_idoso
      WHERE c.id_usuario=? OR i.id_usuario=?;`;
    const [rows] = await db.execute<IPulseira[]>(sql, [idUsuario, idUsuario]);
    return rows;
  }

  async selecionarPorId(id: string): Promise<IPulseira[]> {
    const sql = `
      SELECT id,
             id_cuidador AS idCuidador,
             id_idoso AS idIdoso,
             nome,
             intervalo_leitura_seg AS intervaloLeituraSeg,
             vinculada_em AS vinculadaEm
      FROM pulseira WHERE id=?;`;
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

  // Confere se o usuário logado é o cuidador ou o idoso dessa pulseira.
  // pulseira.id_cuidador e pulseira.id_idoso apontam para cuidador.id e idoso.id,
  // por isso o JOIN até usuario (id_usuario) antes de comparar.
  async usuarioTemAcesso(idPulseira: string, idUsuario: string): Promise<boolean> {
    const sql = `
      SELECT p.id
      FROM pulseira p
      LEFT JOIN cuidador c ON c.id = p.id_cuidador
      LEFT JOIN idoso i ON i.id = p.id_idoso
      WHERE p.id=? AND (c.id_usuario=? OR i.id_usuario=?)
      LIMIT 1;`;
    const [rows] = await db.execute<RowDataPacket[]>(sql, [
      idPulseira,
      idUsuario,
      idUsuario,
    ]);
    return rows.length > 0;
  }

  // NOVO: leituras de uma pulseira, da mais recente para a mais antiga (até 500).
  // O horário sai como texto UTC (com "Z"), assim o fuso do servidor não desloca a hora.
  async selecionarLeituras(idPulseira: string): Promise<RowDataPacket[]> {
    const sql = `
      SELECT DATE_FORMAT(medido_em, '%Y-%m-%dT%H:%i:%sZ') AS medidoEm, bpm, spo2
      FROM leitura
      WHERE id_pulseira=?
      ORDER BY medido_em DESC
      LIMIT 500;`;
    const [rows] = await db.execute<RowDataPacket[]>(sql, [idPulseira]);
    return rows;
  }

  async selecionarStatus(id: string): Promise<RowDataPacket[]> {
    const sql = `
      SELECT p.id, p.vinculada_em, p.intervalo_leitura_seg,
             MAX(l.medido_em) AS ultima_leitura,
             TIMESTAMPDIFF(SECOND, MAX(l.medido_em), NOW()) AS segundos_desde_ultima
      FROM pulseira p
      LEFT JOIN leitura l ON l.id_pulseira = p.id
      WHERE p.id=?
      GROUP BY p.id, p.vinculada_em, p.intervalo_leitura_seg;`;
    const [rows] = await db.execute<RowDataPacket[]>(sql, [id]);
    return rows;
  }

  // UNIFICADO (criar + vincular): cria a pulseira já vinculada,
  // gravando device_token e vinculada_em no mesmo INSERT
  async criar(
    dados: Omit<IPulseira, "id" | "deviceToken" | "vinculadaEm">,
    token: string,
  ): Promise<ResultSetHeader> {
    const sql = `INSERT INTO pulseira
            (id_cuidador, id_idoso, nome, intervalo_leitura_seg, device_token, vinculada_em)
              VALUES (?,?,?,?,?,NOW());`;
    const values = [
      dados.idCuidador,
      dados.idIdoso,
      dados.nome,
      dados.intervaloLeituraSeg ?? INTERVALO_PADRAO_SEG,
      token,
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  // O PUT (editar) não mexe no intervalo: ele só muda por aqui
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

  async atualizarIntervalo(
    id: string,
    intervaloLeituraSeg: number,
  ): Promise<ResultSetHeader> {
    const sql = "UPDATE pulseira SET intervalo_leitura_seg=? WHERE id=?;";
    const [rows] = await db.execute<ResultSetHeader>(sql, [
      intervaloLeituraSeg,
      id,
    ]);
    return rows;
  }

  async deletar(id: string): Promise<ResultSetHeader> {
    const sql = "DELETE FROM pulseira WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }
}