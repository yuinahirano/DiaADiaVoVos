import { Medicamento } from "../models/medicamento.model";
import { MedicamentoRepository } from "../repository/medicamento.repository";
import { IdosoRepository } from "../repository/idoso.repository";
import { TipoFrequencia } from "../enums/tipo-frequencia.enum";
import { StatusMedicamento } from "../enums/status-medicamento.enum";

export class MedicamentoService {
  constructor(private _repository = new MedicamentoRepository(),
    private _idosoRepository = new IdosoRepository()
) {}

  async selecionarPorIdIdoso(idIdoso: string) {
    return await this._repository.selecionarPorIdIdoso(idIdoso);
  }

  async selecionarTodos() {
    return await this._repository.selecionarTodos();
  }

  async selecionarPorId(id: string) {
    return await this._repository.selecionarPorId(id);
  }

  async selecionarPendentes() {
    return await this._repository.selecionarPendentes(new Date());
  }

  async criar(
    nome: string,
    dosagem: string,
    horario: string,
    tipoFrequencia: TipoFrequencia,
    valorFrequencia: number,
    idIdoso: string,
    observacoes?: string,
  ) {
    const medicamento = Medicamento.criar(
      nome,
      dosagem,
      horario,
      tipoFrequencia,
      valorFrequencia,
      idIdoso,
      observacoes
    );
    return await this._repository.criar({
      nome: medicamento.Nome,
      dosagem: medicamento.Dosagem,
      horario: medicamento.Horario,
      tipoFrequencia: medicamento.TipoFrequencia,
      valorFrequencia: medicamento.ValorFrequencia,
      intervaloMinutos: medicamento.IntervaloMinutos,
      proximoHorario: medicamento.ProximoHorario,
      status: medicamento.Status,
      idIdoso: medicamento.IdIdoso,
      observacoes: medicamento.Observacoes,
    } as any);
  }

  async editar(
    nome: string,
    dosagem: string,
    horario: string,
    tipoFrequencia: TipoFrequencia,
    valorFrequencia: number,
    idIdoso: string,
    status: StatusMedicamento,
    observacoes: string,
    id: string,
  ) {
    const idosoExistente = await this._idosoRepository.selecionarPorId(idIdoso);
    if (idosoExistente.length === 0)
      throw new Error("Idoso não encontrado");
    const medicamentoExistente = await this._repository.selecionarPorId(id);
    if (medicamentoExistente.length === 0)
      throw new Error("Medicamento não encontrado");

    const medicamento = Medicamento.editar(
      nome,
      dosagem,
      horario,
      tipoFrequencia,
      valorFrequencia,
      idIdoso,
      status,
      observacoes,
      id
    );

    return await this._repository.editar(id, {
      nome: medicamento.Nome,
      dosagem: medicamento.Dosagem,
      horario: medicamento.Horario,
      tipoFrequencia: medicamento.TipoFrequencia,
      valorFrequencia: medicamento.ValorFrequencia,
      intervaloMinutos: medicamento.IntervaloMinutos,
      proximoHorario: medicamento.ProximoHorario,
      status: medicamento.Status,
      observacoes: medicamento.Observacoes,
      idIdoso: medicamento.IdIdoso,
    } as any);
  }

  async registrarDose(id: string) {
    const medicamentoExistente = await this._repository.selecionarPorId(id);
    if (medicamentoExistente.length === 0)
      throw new Error("Medicamento não encontrado");

    const medicamento = medicamentoExistente[0];
    if (medicamento.status !== StatusMedicamento.ATIVO)
      throw new Error("Medicamento não está ativo");

    const agora = new Date();
    const proximoHorario = Medicamento.avancarHorario(
      new Date(medicamento.proximoHorario),
      medicamento.intervaloMinutos,
      agora
    );

    await this._repository.registrarDose(id, agora, proximoHorario);
    return { ultimaDose: agora, proximoHorario };
  }

  async deletar(id: string) {
    const medicamentoExistente = await this._repository.selecionarPorId(id);
    if (medicamentoExistente.length === 0)
      throw new Error("Medicamento não encontrada");
    return await this._repository.deletar(id);
  }
}