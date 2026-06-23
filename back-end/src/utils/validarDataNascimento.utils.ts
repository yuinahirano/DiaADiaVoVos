export class DataUtils {

  static validarData(value: string): boolean {
    const data = new Date(value);
    return !isNaN(data.getTime());
  }

  static validarIdadeMinima(value: string, idadeMinima: number): boolean {
    const dataNascimento = new Date(value);
    const hoje = new Date();

    const idadeAtual = hoje.getFullYear() - dataNascimento.getFullYear();

    const aniversarioPassou =
      hoje.getMonth() > dataNascimento.getMonth() ||
      (hoje.getMonth() === dataNascimento.getMonth() &&
        hoje.getDate() >= dataNascimento.getDate());

    const idadeReal = aniversarioPassou ? idadeAtual : idadeAtual - 1;

    return idadeReal >= idadeMinima;
  }

  static validarDataPassado(value: string): boolean {
    return new Date(value) < new Date();
  }
}