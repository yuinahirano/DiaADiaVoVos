import { IdosoCuidador } from "../models/idosoCuidador.model";
import { CuidadorRepository } from "../repository/cuidador.repository";
import { IdosoRepository } from "../repository/idoso.repository";
import { IdosoCuidadorRepository } from "../repository/idosoCuidador.repository";

export class IdosoCuidadorService {
  constructor(
    private _repository = new IdosoCuidadorRepository(),
    private _cuidadorRepository = new CuidadorRepository(),
    private _idosoRepository = new IdosoRepository(),
  ) {}

  async selecionarTodos() {
    return await this._repository.selecionarTodos();
  }

  async selecionarPorId(id: string) {
    return await this._repository.selecionarPorId(id);
  }

  async criar(idIdoso: string, idCuidador: string, telefoneEmergencia: string) {
    const idosoCuidador = IdosoCuidador.criar(
      idIdoso,
      idCuidador,
      telefoneEmergencia,
    );
    return await this._repository.criar({
      idIdoso: idosoCuidador.IdIdoso,
      idCuidador: idosoCuidador.IdCuidador,
      telefoneEmergencia: idosoCuidador.TelefoneEmergencia,
    });
  }
  async editar(
    id: string,
    idIdoso: string,
    idCuidador: string,
    telefoneEmergencia: string,
  ) {
    const cuiadorExistente =
      await this._cuidadorRepository.selecionarPorId(idCuidador);
    if (!cuiadorExistente) throw new Error("Cuidador não encontrado");

    const idosoExistente =
      await this._idosoRepository.selecionarPorId(idIdoso);
    if (!idosoExistente) throw new Error("Idoso não encontrado");

    const idosoCuidador = IdosoCuidador.editar(
      id,
      idIdoso,
      idCuidador,
      telefoneEmergencia,
    );

    return await this._repository.editar(id, {
      idIdoso: idosoCuidador.IdIdoso,
      idCuidador: idosoCuidador.IdCuidador,
      telefoneEmergencia: idosoCuidador.TelefoneEmergencia,
    });
  }
  async deletar(id: string) {
    const relacao = await this._repository.selecionarPorId(id);
    if (relacao.length === 0)
      throw new Error("Relação de idoso e cuidador não encontrado");

    return await this._repository.deletar(id);
  }
}
