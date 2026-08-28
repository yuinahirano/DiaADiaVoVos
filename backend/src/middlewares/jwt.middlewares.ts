import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const autenticarToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  // pega o header Authorization da requisição

  const token = authHeader && authHeader.split(" ")[1];
  // o header vem como "Bearer TOKEN" — pega só o token

  if (!token) {
    res.status(401).json({ erro: "Token não informado" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);
    // verifica se o token é válido e não expirou

    (req as any).usuario = payload;
    // adiciona os dados do usuário na requisição para usar nos controllers

    next();
    // libera para o próximo passo (controller)

  } catch (error) {
    res.status(403).json({ erro: "Token inválido ou expirado" });
  }
};
