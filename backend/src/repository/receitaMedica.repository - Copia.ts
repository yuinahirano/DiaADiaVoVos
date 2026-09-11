import { db } from "../database/connection.database";
import { IReceitaMedica } from "../models/receitaMedica.model";
import { ResultSetHeader } from "mysql2";

export class ReceitaMedicaRepository {
  async selecionarTodos(): Promise<IReceitaMedica[]> {
    const [rows] = await db.execute<IReceitaMedica[]>("SELECT * FROM receitamedica;");
    return rows;
  }
  async selecionarPorId(id: string): Promise<IReceitaMedica[]> {
    const sql = "SELECT * FROM receitamedica WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<IReceitaMedica[]>(sql, values);
    return rows;
  }
async criar(dados: Omit<IReceitaMedica, "id">): Promise<ResultSetHeader> {
  const sql = `INSERT INTO receitamedica 
          (descricao, data_emissao, data_vencimento, id_consulta)  
            VALUES (?,?,?,?);`;
  const values = [
    dados.descricao,
    dados.dataEmissao,
    dados.dataVencimento,
    dados.idConsulta,
  ];
  const [rows] = await db.execute<ResultSetHeader>(sql, values);
  return rows;
}

async editar(
  id: string,
  dados: Omit<IReceitaMedica, "id">,
): Promise<ResultSetHeader> {
  console.log(    dados.desconhecido,
    dados.dataEmissao,
    dados.dataVencimento,
    dados.idConsulta,
    id,);
  
  const sql = `UPDATE receitamedica SET 
             descricao=?, data_emissao=?, data_vencimento=?, id_consulta =? 
              WHERE id=?;`;
  const values = [
    dados.descricao,
    dados.dataEmissao,
    dados.dataVencimento,
    dados.idConsulta,
    id,
  ];
  const [rows] = await db.execute<ResultSetHeader>(sql, values);
  return rows;
}

  async deletar(id: string): Promise<ResultSetHeader> {
    const sql = "DELETE FROM receitamedica WHERE id=?;";
    const values = [id];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }
}
