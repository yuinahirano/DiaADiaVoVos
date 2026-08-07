export class EmailUtils {

  static validar(value: string): { valido: boolean; erros: string[] } {
    const erros: string[] = [];

    if (!value || value.trim().length === 0)
      erros.push("Email é obrigatório");

    if (!value.includes("@"))
      erros.push("Email deve conter @");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      erros.push("Formato de email inválido");

    if (value.length > 255)
      erros.push("Email deve ter no máximo 255 caracteres");

    return { valido: erros.length === 0, erros };
  }
}