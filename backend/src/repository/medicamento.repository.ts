import { db } from "../database/connection.database";
import { IMedicamento } from "../models/medicamento.model";
import { ResultSetHeader } from "mysql2";

export class MedicamentoRepository {
  async selecionarTodos(): Promise<IMedicamento[]> {
    const [rows] = await db.execute<IMedicamento[]>(
      `SELECT id, nome, dosagem, horario,
              tipo_frequencia AS tipoFrequencia,
              valor_frequencia AS valorFrequencia,
              intervalo_minutos AS intervaloMinutos,
              proximo_horario AS proximoHorario,
              ultima_dose AS ultimaDose,
              status, observacoes,
              id_idoso AS idIdoso
       FROM medicamento;`
    );
    return rows;
  }
  async selecionarPorId(id: string): Promise<IMedicamento[]> {
    const sql = `SELECT id, nome, dosagem, horario,
                        tipo_frequencia AS tipoFrequencia,
                        valor_frequencia AS valorFrequencia,
                        intervalo_minutos AS intervaloMinutos,
                        proximo_horario AS proximoHorario,
                        ultima_dose AS ultimaDose,
                        status, observacoes,
                        id_idoso AS idIdoso
                 FROM medicamento WHERE id=?;`;
    const values = [id];
    const [rows] = await db.execute<IMedicamento[]>(sql, values);
    return rows;
  }
<<<<<<< HEAD
async criar(dados: Omit<IMedicamento, "id">): Promise<ResultSetHeader> {
    console.log(    dados.nome,
    dados.dosagem,
    dados.horario,
    dados.frequencia,
    dados.observacoes,
    dados.idIdoso,
);
    
=======
  async selecionarPorIdIdoso(idIdoso: string): Promise<IMedicamento[]> {
<<<<<<< HEAD
  const sql = "SELECT * FROM medicamento WHERE id_idoso=?;";
  const values = [idIdoso];
  const [rows] = await db.execute<IMedicamento[]>(sql, values);
  return rows;
}
async criar(dados: Omit<IMedicamento, "id">): Promise<ResultSetHeader> {
>>>>>>> 6267fb6640d639d94f17324c76df5f279f3f574f
  const sql = `INSERT INTO medicamento 
          (nome, dosagem, horario, frequencia, observacoes, id_idoso)  
            VALUES (?,?,?,?,?,?);`;
  const values = [
    dados.nome,
    dados.dosagem,
    dados.horario,
    dados.frequencia,
    dados.observacoes,
    dados.idIdoso,
  ];
  const [rows] = await db.execute<ResultSetHeader>(sql, values);
  return rows;
}
=======
    const sql = `SELECT id, nome, dosagem, horario,
                        tipo_frequencia AS tipoFrequencia,
                        valor_frequencia AS valorFrequencia,
                        intervalo_minutos AS intervaloMinutos,
                        proximo_horario AS proximoHorario,
                        ultima_dose AS ultimaDose,
                        status, observacoes,
                        id_idoso AS idIdoso
                 FROM medicamento WHERE id_idoso=?
                 ORDER BY proximo_horario ASC;`;
    const values = [idIdoso];
    const [rows] = await db.execute<IMedicamento[]>(sql, values);
    return rows;
  }
  async selecionarPendentes(ate: Date): Promise<IMedicamento[]> {
    const sql = `SELECT id, nome, dosagem, horario,
                        tipo_frequencia AS tipoFrequencia,
                        valor_frequencia AS valorFrequencia,
                        intervalo_minutos AS intervaloMinutos,
                        proximo_horario AS proximoHorario,
                        ultima_dose AS ultimaDose,
                        status, observacoes,
                        id_idoso AS idIdoso
                 FROM medicamento
                 WHERE status='ativo' AND proximo_horario <= ?
                 ORDER BY proximo_horario ASC;`;
    const values = [ate];
    const [rows] = await db.execute<IMedicamento[]>(sql, values);
    return rows;
  }
  async criar(dados: Omit<IMedicamento, "id">): Promise<ResultSetHeader> {
    const sql = `INSERT INTO medicamento 
            (nome, dosagem, horario, tipo_frequencia, valor_frequencia,
             intervalo_minutos, proximo_horario, status, observacoes, id_idoso)  
              VALUES (?,?,?,?,?,?,?,?,?,?);`;
    const values = [
      dados.nome,
      dados.dosagem,
      dados.horario,
      dados.tipoFrequencia,
      dados.valorFrequencia,
      dados.intervaloMinutos,
      dados.proximoHorario,
      dados.status,
      dados.observacoes ?? null,
      dados.idIdoso,
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }
>>>>>>> develop

  async editar(
    id: string,
    dados: Omit<IMedicamento, "id">,
  ): Promise<ResultSetHeader> {
    const sql = `UPDATE medicamento SET 
       nome=?, dosagem=?, horario=?, tipo_frequencia=?, valor_frequencia=?,
       intervalo_minutos=?, proximo_horario=?, status=?, observacoes=?, id_idoso=?
       WHERE id=?;`;
    const values = [
      dados.nome,
      dados.dosagem,
      dados.horario,
      dados.tipoFrequencia,
      dados.valorFrequencia,
      dados.intervaloMinutos,
      dados.proximoHorario,
      dados.status,
      dados.observacoes ?? null,
      dados.idIdoso,
      id,
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async registrarDose(
    id: string,
    ultimaDose: Date,
    proximoHorario: Date,
  ): Promise<ResultSetHeader> {
    const sql = `UPDATE medicamento SET 
       ultima_dose=?, proximo_horario=?
       WHERE id=?;`;
    const values = [ultimaDose, proximoHorario, id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async deletar(id: string): Promise<ResultSetHeader> {
    const sql = "DELETE FROM medicamento WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }
}