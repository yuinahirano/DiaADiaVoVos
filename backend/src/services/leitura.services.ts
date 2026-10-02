import { Leitura } from "../models/leitura.model";
import { LeituraRepository } from "../repository/leitura.repository";
import { PulseiraRepository } from "../repository/pulseira.repository";

export class LeituraService {
  constructor(
    private _repository = new LeituraRepository(),
    private _pulseiraRepository = new PulseiraRepository(),
  ) {}

  async selecionarTodos() {
    return await this._repository.selecionarTodos();
  }

  async selecionarPorId(id: string) {
    return await this._repository.selecionarPorId(id);
  }

  async criar(idPulseira: string, bpm: number, spo2: number) {
    const leitura = Leitura.criar(idPulseira, bpm, spo2);
    return await this._repository.criar({
      idPulseira: leitura.IdPulseira,
      bpm: leitura.Bpm,
      spo2: leitura.Spo2,
    });
  }

  async editar(
    id: string,
    idPulseira: string,
    bpm: number,
    spo2: number,
  ) {
    const pulseiraExistente =
      await this._pulseiraRepository.selecionarPorId(idPulseira);
    if (pulseiraExistente.length === 0)
      throw new Error("Pulseira não encontrada");

    const leituraExistente = await this._repository.selecionarPorId(id);
    if (leituraExistente.length === 0)
      throw new Error("Leitura não encontrada");

    const leitura = Leitura.editar(idPulseira, bpm, spo2, id);
    return await this._repository.editar(id, {
      idPulseira: leitura.IdPulseira,
      bpm: leitura.Bpm,
      spo2: leitura.Spo2,
    });
  }

  async deletar(id: string) {
    const leituraExistente = await this._repository.selecionarPorId(id);
    if (leituraExistente.length === 0)
      throw new Error("Leitura não encontrada");
    return await this._repository.deletar(id);
  }
}