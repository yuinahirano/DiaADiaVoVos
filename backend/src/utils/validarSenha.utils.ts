export class SenhaUtils {

  static validar(value: string): { valido: boolean; erros: string[] } {
    const erros: string[] = [];

    if (!value || value.trim().length === 0)
      erros.push("Senha é obrigatória");

    if (!/[A-Z]/.test(value))
      erros.push("Senha deve conter ao menos uma letra maiúscula");

    if (!/[a-z]/.test(value))
      erros.push("Senha deve conter ao menos uma letra minúscula");

    if (!/[0-9]/.test(value))
      erros.push("Senha deve conter ao menos um número");

    if (!/[!@#$%^&*]/.test(value))
      erros.push("Senha deve conter ao menos um caractere especial (!@#$%^&*)");

    if (value.length < 8)
      erros.push("Senha deve ter no mínimo 8 caracteres");

    if (value.length > 50)
      erros.push("Senha deve ter no máximo 50 caracteres");

    return { valido: erros.length === 0, erros };
  }
}