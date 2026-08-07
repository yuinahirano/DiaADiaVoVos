export class CpfUtils {

  static limpar(cpf: string): string {
    return cpf.replace(/[.\-]/g, "");
    // remove pontos e traços → "123.456.789-09" vira "12345678909"
  }

  static validar(cpf: string): boolean {
    const cpfLimpo = this.limpar(cpf);

    if (!this._validarTamanho(cpfLimpo)) return false;
    if (!this._validarDigitosUnicos(cpfLimpo)) return false;
    if (!this._validarPrimeiroDigito(cpfLimpo)) return false;
    if (!this._validarSegundoDigito(cpfLimpo)) return false;

    return true;
  }

  private static _validarTamanho(cpf: string): boolean {
    return cpf.length === 11 && /^\d+$/.test(cpf);
    // verifica se tem 11 dígitos e se são todos numéricos
  }

  private static _validarDigitosUnicos(cpf: string): boolean {
    return !/^(\d)\1+$/.test(cpf);
    // rejeita "11111111111", "22222222222", etc
  }

  private static _calcularDigito(cpf: string, pesoInicial: number): number {
    const soma = cpf
      .split("")
      .reduce((acc, digito, index) => acc + Number(digito) * (pesoInicial - index), 0);
    // multiplica cada dígito pelo peso correspondente e soma tudo

    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
    // se resto < 2 o dígito é 0, senão é 11 - resto
  }

  private static _validarPrimeiroDigito(cpf: string): boolean {
    const primeiroDigito = this._calcularDigito(cpf.slice(0, 9), 10);
    // usa os 9 primeiros dígitos com peso inicial 10

    return primeiroDigito === Number(cpf[9]);
  }

  private static _validarSegundoDigito(cpf: string): boolean {
    const segundoDigito = this._calcularDigito(cpf.slice(0, 10), 11);
    // usa os 10 primeiros dígitos com peso inicial 11

    return segundoDigito === Number(cpf[10]);
  }
}