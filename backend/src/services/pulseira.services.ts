import { Pulseira } from "../models/pulseira.model";
import { PulseiraRepository } from "../repository/pulseira.repository";
import { IdosoRepository } from "../repository/idoso.repository";
import { CuidadorRepository } from "../repository/cuidador.repository";

export class PulseiraService {
  constructor(
    private _repository = new PulseiraRepository(),
    private _idosoRepository = new IdosoRepository(),
    private _cuidadorRepository = new CuidadorRepository(),
  ) {}

  async selecionarTodos() {
    return await this._repository.selecionarTodos();
  }

  async selecionarPorId(id: string) {
    return await this._repository.selecionarPorId(id);
  }

  async criar(idIdoso: string, idCuidador: string, nome: string) {
    const pulseira = Pulseira.criar(nome, idIdoso, idCuidador);
    return await this._repository.criar({
      nome: pulseira.Nome,
      idIdoso: pulseira.IdIdoso,
      idCuidador: pulseira.IdCuidador,
    });
  }

  async editar(
    id: string,
    idIdoso: string,
    idCuidador: string,
    nome: string,
  ) {
    const idosoExistente = await this._idosoRepository.selecionarPorId(idIdoso);
    if (idosoExistente.length === 0) throw new Error("Idoso não encontrado");

    const cuidadorExistente =
      await this._cuidadorRepository.selecionarPorId(idCuidador);
    if (cuidadorExistente.length === 0)
      throw new Error("Cuidador não encontrado");

    const pulseiraExistente = await this._repository.selecionarPorId(id);
    if (pulseiraExistente.length === 0)
      throw new Error("Pulseira não encontrada");

    const pulseira = Pulseira.editar(nome, idIdoso, idCuidador, id);
    return await this._repository.editar(id, {
      nome: pulseira.Nome,
      idIdoso: pulseira.IdIdoso,
      idCuidador: pulseira.IdCuidador,
    });
  }

  async deletar(id: string) {
    const pulseiraExistente = await this._repository.selecionarPorId(id);
    if (pulseiraExistente.length === 0)
      throw new Error("Pulseira não encontrada");
    return await this._repository.deletar(id);
  }
}