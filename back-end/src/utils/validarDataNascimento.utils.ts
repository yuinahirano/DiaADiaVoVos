export class DataUtils {

  static validarData(value: number): boolean {
    const data = new Date(value);
    return !isNaN(data.getTime());
    // verifica se o timestamp gera uma data válida
  }

  static validarIdadeMinima(value: number, idadeMinima: number): boolean {
    const dataNascimento = new Date(value);
    const hoje = new Date();

    const idadeAtual = hoje.getFullYear() - dataNascimento.getFullYear();

    const aniversarioPassou =
      hoje.getMonth() > dataNascimento.getMonth() ||
      (hoje.getMonth() === dataNascimento.getMonth() &&
        hoje.getDate() >= dataNascimento.getDate());
    // verifica se o aniversário já ocorreu esse ano
    // para não contar o ano antes de completar

    const idadeReal = aniversarioPassou ? idadeAtual : idadeAtual - 1;

    return idadeReal >= idadeMinima;
  }

  static validarDataPassado(value: number): boolean {
    return new Date(value) < new Date();
    // verifica se a data é anterior a hoje
  }
}