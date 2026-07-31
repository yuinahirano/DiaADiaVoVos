import { Doenca } from "../models/doenca.model";
import { DoencaRepository } from "../repository/doenca.repository";
import { IdosoRepository } from "../repository/idoso.repository";

export class DoencaService {
  constructor(private _repository = new DoencaRepository(),
    private _idosoRepository = new IdosoRepository()
) {}

  async selecionarTodos() {
    return await this._repository.selecionarTodos();
  }

  async selecionarPorId(id: string) {
    return await this._repository.selecionarPorId(id);
  }

  async criar(
    idIdoso: string,
    nome: string,
    descricao: string
  ) {
    const doenca = Doenca.criar( nome, descricao, idIdoso);
    return await this._repository.criar({
      nome: doenca.Nome,
      descricao: doenca.Descricao,
      idIdoso: doenca.IdIdoso
    });
  }
  async editar(
    id:string,
    idIdoso: string,
    nome: string,
    descricao: string
  ) {
    const idosoExsitente = await this._idosoRepository.selecionarPorId(idIdoso);
    if (!idosoExsitente)
      throw new Error("Idoso não encontrado");
    const doencaExistente = await this._repository.selecionarPorId(id);
    if (!doencaExistente)
      throw new Error("Doença não encontrada");

    const doenca = Doenca.editar(nome, descricao, idIdoso, id);
    return await this._repository.editar(id, {
      nome: doenca.Nome,
      descricao: doenca.Descricao,
      idIdoso: doenca.IdIdoso
    });
    
}
  async deletar(id: string) {
    const doencaExistente = await this._repository.selecionarPorId(id);
    if (doencaExistente.length === 0)
      throw new Error("Doença não encontrada");
    return await this._repository.deletar(id);
  }
}