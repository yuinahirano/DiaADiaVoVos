import { Request, Response, NextFunction } from "express";
import { randomBytes } from "crypto";
import { PulseiraRepository } from "../repository/pulseira.repository";

const repo = new PulseiraRepository();

// NOVO: gera o token do dispositivo (usado no POST /pulseira)
// O controller lê o token em req.deviceToken e repassa ao service
export function gerarDeviceTokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    (req as any).deviceToken = randomBytes(32).toString("hex"); // 64 caracteres
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Ocorreu um erro no servidor" });
  }
}

export async function deviceAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.header("x-device-token");
    if (!token)
      return res.status(401).json({ message: "Token do dispositivo ausente" });

    const [pulseira] = await repo.selecionarPorToken(token);
    if (!pulseira) return res.status(401).json({ message: "Token inválido" });

    (req as any).pulseiraId = pulseira.id;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Ocorreu um erro no servidor" });
  }
}