// bcrypt.config.ts
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const hashSenha = async (senha: string): Promise<string> => {
  return await bcrypt.hash(senha, SALT_ROUNDS);
};

export const compararSenha = async (senha: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(senha, hash);
};