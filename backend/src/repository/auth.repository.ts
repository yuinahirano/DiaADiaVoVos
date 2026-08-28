import { RowDataPacket } from "mysql2"; // Tipo auxiliar do mysql2

import { db } from "../database/connection.database";

// Define os dados do usuário retornados pela consulta
export interface UsuarioComPapel extends RowDataPacket {
  id: string;
  nome: string;
  email: string;
  idIdoso: number | null;
  idCuidador: number | null;
  [key: string]: any;
}

// Busca o usuário pelo ID e retorna seu papel
export async function buscarUsuarioComPapel(
  idUsuario: string
): Promise<UsuarioComPapel | null> {
  const query = `
    SELECT
      u.*,
      i.id AS idIdoso,
      c.id AS idCuidador
    FROM usuario u
    LEFT JOIN idoso i ON i.id_usuario = u.id
    LEFT JOIN cuidador c ON c.id_usuario = u.id
    WHERE u.id = ?;
  `;

  // Executa a consulta no banco de dados
  const [rows] = await db.query<UsuarioComPapel[]>(query, [idUsuario]);

  // Retorna o usuário encontrado ou null
  return rows[0] ?? null;
}