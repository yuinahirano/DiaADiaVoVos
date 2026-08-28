import { UsuarioComPapel } from "../../repository/auth.repository";

// Isso "estende" o tipo Request do Express, adicionando o campo `usuario`.
// Sem isso, o TypeScript reclamaria de "req.usuario não existe" em qualquer lugar
// que você tentasse usar depois do middleware.
declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioComPapel; // opcional porque antes do authMiddleware rodar, ele não existe
    }
  }
}