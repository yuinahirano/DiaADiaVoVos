// src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../utils/jwt.types";
import { buscarUsuarioComPapel } from "../repository/auth.repository";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Obtém o token enviado no cabeçalho da requisição
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    // Remove o "Bearer " e obtém apenas o token
    const token = authHeader.split(" ")[1];

    // Valida o token e obtém os dados do usuário
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    // Busca o usuário pelo ID presente no token
    const usuario = await buscarUsuarioComPapel(payload.id);

    if (!usuario) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    // Disponibiliza o usuário para as próximas etapas da requisição
    req.usuario = usuario;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Token inválido ou expirado",
    });
  }
}