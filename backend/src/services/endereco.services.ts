import { Endereco } from "../models/endereco.model";
import { EnderecoRepository } from "../repository/endereco.repository";
import { ConsultaCep } from "../utils/consultaCep.utils";

export class EnderecoService {
  constructor(private _repository = new EnderecoRepository()) {}

  async selecionarTodos() {
    return await this._repository.selecionarTodos();
  }

  async selecionarPorId(id: string) {
    return await this._repository.selecionarPorId(id);
  }

async criar(
  numero: number,
  complemento: string,
  cep: string,
  idUsuario: string,
) {
  const dadosCep = await ConsultaCep.consultar(cep);

  const endereco = new Endereco(
    dadosCep.logradouro,
    numero,
    complemento,
    dadosCep.bairro,
    dadosCep.cidade,
    dadosCep.uf,
    cep,
    idUsuario,
  );

  return await this._repository.criar({
    logradouro: endereco.Logradouro,
    numero: endereco.Numero,
    complemento: endereco.Complemento ?? "",
    bairro: endereco.Bairro,
    cidade: endereco.Cidade,
    uf: endereco.Uf,
    cep: endereco.Cep,
    idUsuario: endereco.IdUsuario,
  });
}

async editar(
  id: string,
  numero: number,
  complemento: string,
  cep: string,
  idUsuario: string,
) {
  const dadosCep = await ConsultaCep.consultar(cep);

  const endereco = new Endereco(
    dadosCep.logradouro,
    numero,
    complemento,
    dadosCep.bairro,
    dadosCep.cidade,
    dadosCep.uf,
    cep,
    idUsuario,
  );

  return await this._repository.editar(id, {
    logradouro: endereco.Logradouro,
    numero: endereco.Numero,
    complemento: endereco.Complemento ?? "",
    bairro: endereco.Bairro,
    cidade: endereco.Cidade,
    uf: endereco.Uf,
    cep: endereco.Cep,
    idUsuario: endereco.IdUsuario,
  });
}

  async deletar(id: string) {
    return await this._repository.deletar(id);
  }
}