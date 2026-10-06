import { ILeituraLote, Leitura } from "../models/leitura.model";
import { LeituraRepository } from "../repository/leitura.repository";
import { PulseiraRepository } from "../repository/pulseira.repository";

export const MAX_LOTE = 500;

// Faixa de plausibilidade do sensor (filtro de erro, não de normalidade).
// É mais larga que a do model de propósito: um idoso com 45 ou 180 bpm
// é justamente uma leitura que precisa ser guardada.
const BPM_MIN = 30;
const BPM_MAX = 220;
const SPO2_MIN = 50;
const SPO2_MAX = 100;

// Relógio da pulseira sem acerto cai em 1970; nada anterior a isso é válido
const DATA_MINIMA_MS = Date.UTC(2024, 0, 1);
const TOLERANCIA_FUTURO_MS = 5 * 60 * 1000;

// Leituras inválidas são descartadas (não rejeitam o lote inteiro).
// Se uma leitura ruim derrubasse o lote com 400, o app tentaria reenviar para sempre.
function validarLote(itens: unknown[]) {
  const validas: ILeituraLote[] = [];
  const limite = Date.now() + TOLERANCIA_FUTURO_MS;

  for (const item of itens as any[]) {
    const ms =
      typeof item?.medidoEm === "string"
        ? new Date(item.medidoEm).getTime()
        : NaN;
    const { bpm, spo2 } = item ?? {};

    const ok =
      !isNaN(ms) &&
      ms >= DATA_MINIMA_MS &&
      ms <= limite &&
      Number.isInteger(bpm) &&
      bpm >= BPM_MIN &&
      bpm <= BPM_MAX &&
      Number.isInteger(spo2) &&
      spo2 >= SPO2_MIN &&
      spo2 <= SPO2_MAX;

    if (ok)
      validas.push({ medidoEmSegundos: Math.floor(ms / 1000), bpm, spo2 });
  }

  return { validas, invalidas: itens.length - validas.length };
}

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

  // O usuário logado precisa ser o cuidador ou o idoso da pulseira
  async usuarioTemAcesso(idUsuario: string, idPulseira: string) {
    return await this._pulseiraRepository.usuarioTemAcesso(
      idPulseira,
      idUsuario,
    );
  }

  async criarLote(idPulseira: string, itens: unknown[]) {
    const { validas, invalidas } = validarLote(itens);
    const inseridas = await this._repository.criarLote(idPulseira, validas);
    return {
      recebidas: itens.length,
      inseridas,
      duplicadas: validas.length - inseridas,
      invalidas,
    };
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