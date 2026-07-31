import { Consulta } from "../models/consulta.model";
import { ConsultaRepository } from "../repository/consulta.repository";
import { IdosoRepository } from "../repository/idoso.repository";

export class ConsultaService {
  constructor(private _repository = new ConsultaRepository(),
    private _idosoRepository = new IdosoRepository()
) {}

  async selecionarTodos() {
    return await this._repository.selecionarTodos();
  }

  async selecionarPorId(id: string) {
    return await this._repository.selecionarPorId(id);
  }

  async criar(
    nomeMedico: string,
    horario: string,
    localConsulta: string,
    idIdoso: string,
  ) {
    const doenca = Consulta.criar(nomeMedico, horario, localConsulta, idIdoso);
    return await this._repository.criar({
      nomeMedico: doenca.NomeMedico,
      horario: doenca.Horario,
      localConsulta: doenca.LocalConsulta,
      idIdoso: doenca.IdIdoso,

    });
  }
  async editar(
  nomeMedico:string,
  horario:string,
  localConsulta:string,
  idIdoso:string,
  id:string,
  ) {
    const cuiadorExistente = await this._idosoRepository.selecionarPorId(idIdoso);
    if (cuiadorExistente.length === 0)
      throw new Error("Idoso não encontrado");
    const consultaExistente = await this._repository.selecionarPorId(id);
    if (consultaExistente.length === 0)
      throw new Error("consulta não encontrada");

    const consulta = Consulta.editar(nomeMedico, horario, localConsulta, idIdoso, id);

    return await this._repository.editar(id, {
      nomeMedico: consulta.NomeMedico,
      horario: consulta.Horario,
      localConsulta: consulta.LocalConsulta,
      idIdoso: consulta.IdIdoso
    });
    
}
  async deletar(id: string) {
    const consultaExistente = await this._repository.selecionarPorId(id);
    if (consultaExistente.length === 0)
      throw new Error("Consulta não encontrada");
    return await this._repository.deletar(id);
  }
}