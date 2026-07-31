import { db } from "../database/connection.database";
import { IConsulta } from "../models/consulta.model";
import { ResultSetHeader } from "mysql2";

export class ConsultaRepository {
  async selecionarTodos(): Promise<IConsulta[]> {
    const [rows] = await db.execute<IConsulta[]>("SELECT * FROM consulta;");
    return rows;
  }
  async selecionarPorId(id: string): Promise<IConsulta[]> {
    const sql = "SELECT * FROM consulta WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<IConsulta[]>(sql, values);
    return rows;
  }
async criar(dados: Omit<IConsulta, "id">): Promise<ResultSetHeader> {
  const sql = `INSERT INTO consulta 
          (nome_medico, horario, local_consulta, id_idoso)  
            VALUES (?,?,?,?);`;
  const values = [
    dados.nomeMedico,
    dados.horario,
    dados.localConsulta,
    dados.idIdoso,
  ];
  const [rows] = await db.execute<ResultSetHeader>(sql, values);
  return rows;
}

async editar(
  id: string,
  dados: Omit<IConsulta, "id">,
): Promise<ResultSetHeader> {
  console.log(    dados.nomeMedico,
    dados.horario,
    dados.localConsulta,
    dados.idIdoso,
    id,);
  
  const sql = `UPDATE consulta SET 
             nome_medico=?, horario=?, local_consulta=?, id_idoso =? 
              WHERE id=?;`;
  const values = [
    dados.nomeMedico,
    dados.horario,
    dados.localConsulta,
    dados.idIdoso,
    id,
  ];
  const [rows] = await db.execute<ResultSetHeader>(sql, values);
  return rows;
}

  async deletar(id: string): Promise<ResultSetHeader> {
    const sql = "DELETE FROM consulta WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }
}
