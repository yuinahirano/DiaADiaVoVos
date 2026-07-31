import { db } from "../database/connection.database";
import { IMedicamento } from "../models/medicamento.model";
import { ResultSetHeader } from "mysql2";

export class MedicamentoRepository {
  async selecionarTodos(): Promise<IMedicamento[]> {
    const [rows] = await db.execute<IMedicamento[]>("SELECT * FROM medicamento;");
    return rows;
  }
  async selecionarPorId(id: string): Promise<IMedicamento[]> {
    const sql = "SELECT * FROM medicamento WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<IMedicamento[]>(sql, values);
    return rows;
  }
async criar(dados: Omit<IMedicamento, "id">): Promise<ResultSetHeader> {
    console.log(    dados.nome,
    dados.dosagem,
    dados.horario,
    dados.frequencia,
    dados.observacoes,
    dados.idIdoso,
);
    
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

async editar(
  id: string,
  dados: Omit<IMedicamento, "id">,
): Promise<ResultSetHeader> {  
const sql = `UPDATE medicamento SET 
   nome=?, dosagem=?, horario=?, frequencia=?, observacoes=?, id_idoso=?
   WHERE id=?;`;
  const values = [
    dados.nome,
    dados.dosagem,
    dados.horario,
    dados.frequencia,
    dados.observacoes,
    dados.idIdoso,
    id,
  ];
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
