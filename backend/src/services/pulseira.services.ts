import {
  Pulseira,
  INTERVALO_PADRAO_SEG,
  validarIntervalo,
} from "../models/pulseira.model";
import { PulseiraRepository } from "../repository/pulseira.repository";
import { IdosoRepository } from "../repository/idoso.repository";
import { CuidadorRepository } from "../repository/cuidador.repository";

// Folga para "conectada": o app sincroniza a cada 60 s, então a leitura
// pode chegar à API até ~1 min depois de ter sido medida
const MARGEM_SEGUNDOS = 60;

export class PulseiraService {
  constructor(
    private _repository = new PulseiraRepository(),
    private _idosoRepository = new IdosoRepository(),
    private _cuidadorRepository = new CuidadorRepository(),
  ) {}

  async selecionarTodos() {
    return await this._repository.selecionarTodos();
  }

  // NOVO: pulseiras do usuário (id vem do token, lido pelo app)
  async selecionarPorUsuario(idUsuario: string) {
    return await this._repository.selecionarPorUsuario(idUsuario);
  }

  async selecionarPorId(id: string) {
    return await this._repository.selecionarPorId(id);
  }

  // UNIFICADO (criar + vincular): recebe o token gerado pelo middleware
  // e cria a pulseira já vinculada
  async criar(
    idIdoso: string,
    idCuidador: string,
    nome: string,
    deviceToken: string,
    intervaloLeituraSeg?: number,
  ) {
    if (!deviceToken) throw new Error("Token do dispositivo não gerado");

    const pulseira = Pulseira.criar(
      nome,
      idIdoso,
      idCuidador,
      intervaloLeituraSeg ?? INTERVALO_PADRAO_SEG,
    );
    const resultado = await this._repository.criar(
      {
        nome: pulseira.Nome,
        idIdoso: pulseira.IdIdoso,
        idCuidador: pulseira.IdCuidador,
        intervaloLeituraSeg: pulseira.IntervaloLeituraSeg,
      },
      deviceToken,
    );
    return { ...resultado, token: deviceToken };
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

  // Só troca o intervalo de leitura (a pulseira recebe na próxima conexão do app)
  async atualizarIntervalo(id: string, intervaloLeituraSeg: unknown) {
    const intervalo = validarIntervalo(intervaloLeituraSeg);

    const existente = await this._repository.selecionarPorId(id);
    if (existente.length === 0) throw new Error("Pulseira não encontrada");

    await this._repository.atualizarIntervalo(id, intervalo);
    return { intervaloLeituraSeg: intervalo };
  }

  // NOVO: leituras de uma pulseira
  async selecionarLeituras(id: string) {
    const existente = await this._repository.selecionarPorId(id);
    if (existente.length === 0) throw new Error("Pulseira não encontrada");
    return await this._repository.selecionarLeituras(id);
  }

  async status(id: string) {
    const [row] = await this._repository.selecionarStatus(id);
    if (!row) throw new Error("Pulseira não encontrada");

    const intervalo: number = row.intervalo_leitura_seg ?? INTERVALO_PADRAO_SEG;
    // Com leitura a cada 10 min, um limite fixo de 30 s mostraria "desconectada" quase sempre
    const limite = intervalo * 2 + MARGEM_SEGUNDOS;
    const segundos = row.segundos_desde_ultima;
    return {
      vinculada: !!row.vinculada_em,
      conectada: segundos !== null && segundos <= limite,
      ultimaLeitura: row.ultima_leitura,
      intervaloLeituraSeg: intervalo,
    };
  }

  async deletar(id: string) {
    const pulseiraExistente = await this._repository.selecionarPorId(id);
    if (pulseiraExistente.length === 0)
      throw new Error("Pulseira não encontrada");
    return await this._repository.deletar(id);
  }
}