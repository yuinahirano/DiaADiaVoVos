import { Request, Response, NextFunction } from "express";

// Esses middlewares rodam DEPOIS do authMiddleware (que já preencheu req.usuario).
// Eles não validam token, só checam se o usuário tem o papel necessário pra acessar a rota.

// Bloqueia a rota se o usuário não tiver um registro de cuidador vinculado
export function requireCuidador(req: Request, res: Response, next: NextFunction) {
  if (!req.usuario?.idCuidador) {
    return res.status(403).json({ message: "Acesso restrito a cuidadores" });
    // 403 = "Forbidden": diferente de 401, aqui o usuário ESTÁ autenticado,
    // só não tem permissão pra essa ação específica
  }
  next();
}

// Mesma lógica, mas pro papel de idoso
export function requireIdoso(req: Request, res: Response, next: NextFunction) {
  if (!req.usuario?.idIdoso) {
    return res.status(403).json({ message: "Acesso restrito a idosos" });
  }
  next();
}