import axios from "axios";

export class ConsultaCep {
  static consultar = async (cep: string) => {
    const cepRegex = /^[0-9]{8}$/;

    if (!cepRegex.test(cep)) {
      throw new Error("CEP inválido");
    }

    const respApi = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

    if (!respApi.data || respApi.data.erro) {
      throw new Error("CEP não encontrado");
    }

    return {
      uf: respApi.data.uf,
      logradouro: respApi.data.logradouro,
      cidade: respApi.data.localidade,
      bairro: respApi.data.bairro,
    };
  };
}