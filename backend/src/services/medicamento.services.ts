import { Medicamento } from "../models/medicamento.model";
import { MedicamentoRepository } from "../repository/medicamento.repository";
import { IdosoRepository } from "../repository/idoso.repository";

export class MedicamentoService {
  constructor(private _repository = new MedicamentoRepository(),
    private _idosoRepository = new IdosoRepository()
) {}

  async selecionarTodos() {
    return await this._repository.selecionarTodos();
  }

  async selecionarPorId(id: string) {
    return await this._repository.selecionarPorId(id);
  }

  async criar(
    nome: string,
    dosagem: string,
    horario: string,
    frequencia: string,
    idIdoso: string,
    observacoes?: string,
  ) {
    const medicamento = Medicamento.criar(nome, dosagem, horario, frequencia, idIdoso, observacoes);
    return await this._repository.criar({
      nome: medicamento.Nome,
      dosagem: medicamento.Dosagem,
      horario: medicamento.Horario,
      frequencia: medicamento.Frequencia,
      idIdoso: medicamento.IdIdoso,
      observacoes: medicamento.Observacoes,

    });
  }
  async editar(
    nome: string,
    dosagem: string,
    horario: string,
    frequencia: string,
    idIdoso: string,
    observacoes: string,
    id:string,
  ) {
    const idosoExistente = await this._idosoRepository.selecionarPorId(idIdoso);
    if (idosoExistente.length === 0)
      throw new Error("Idoso não encontrado");
    const medicamentoExistente = await this._repository.selecionarPorId(id);
    if (medicamentoExistente.length === 0)
      throw new Error("Medicamento não encontrado");

    const medicamento = Medicamento.editar(nome, dosagem, horario, frequencia, idIdoso, observacoes, id);

    return await this._repository.editar(id, {
      nome: medicamento.Nome,
      dosagem: medicamento.Dosagem,
      horario: medicamento.Horario,
      frequencia: medicamento.Frequencia,
      observacoes: medicamento.Observacoes,
      idIdoso: medicamento.IdIdoso,
    });
    
}
  async deletar(id: string) {
    const medicamentoExistente = await this._repository.selecionarPorId(id);
    if (medicamentoExistente.length === 0)
      throw new Error("Medicamento não encontrada");
    return await this._repository.deletar(id);
  }
}