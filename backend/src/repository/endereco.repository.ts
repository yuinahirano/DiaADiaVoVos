import { db } from "../database/connection.database";
import { IEndereco } from "../models/endereco.model";
import { ResultSetHeader } from "mysql2";

export class EnderecoRepository {
  async selecionarTodos(): Promise<IEndereco[]> {
    const [rows] = await db.execute<IEndereco[]>("SELECT * FROM enderecos;");
    return rows;
  }

  async selecionarPorId(id: string): Promise<IEndereco[]> {
    const sql = "SELECT * FROM enderecos WHERE id=?;";
    const [rows] = await db.execute<IEndereco[]>(sql, [id]);
    return rows;
  }

  async criar(dados: Omit<IEndereco, "id">): Promise<ResultSetHeader> {
    const sql = `INSERT INTO enderecos 
      (logradouro, numero, complemento, bairro, cidade, UF, CEP, id_usuario)  
        VALUES (?,?,?,?,?,?,?,?);`;
    const values = [
      dados.logradouro,
      dados.numero,
      dados.complemento,
      dados.bairro,
      dados.cidade,
      dados.uf,
      dados.cep,
      dados.idUsuario,
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async editar(id: string, dados: Omit<IEndereco, "id">): Promise<ResultSetHeader> {
    console.log(     dados.logradouro,
      dados.numero,
      dados.complemento,
      dados.bairro,
      dados.cidade,
      dados.uf,
      dados.cep,
      id,);
    
    const sql = `UPDATE enderecos SET 
      logradouro=?, numero=?, complemento=?, bairro=?, cidade=?, UF=?, CEP=?
        WHERE id=?;`;
    const values = [
      dados.logradouro,
      dados.numero,
      dados.complemento,
      dados.bairro,
      dados.cidade,
      dados.uf,
      dados.cep,
      id,
    ];
    const [rows] = await db.execute<ResultSetHeader>(sql, values);
    return rows;
  }

  async deletar(id: string): Promise<ResultSetHeader> {
    const sql = "DELETE FROM enderecos WHERE id=?;";
    const [rows] = await db.execute<ResultSetHeader>(sql, [id]);
    return rows;
  }
}