import { SolicitacaoPulseira } from "../models/solicitacaoPulseira.model";
import { SolicitacaoPulseiraRepository } from "../repository/solicitacaoPulseira.repository";
import { IdosoRepository } from "../repository/idoso.repository";
import { StatusSolicitacao } from "../enums/statusSolicitacao.enums";
import { PulseiraService } from "./pulseira.services";

export class SolicitacaoPulseiraService {
  constructor(
    private _repository = new SolicitacaoPulseiraRepository(),
    private _idosoRepository = new IdosoRepository(),
    private _pulseiraService = new PulseiraService(),
  ) {}

  async selecionarTodos() {
    return await this._repository.selecionarTodos();
  }

  async selecionarPorId(id: string) {
    return await this._repository.selecionarPorId(id);
  }

  async selecionarPorIdoso(idIdoso: string) {
    return await this._repository.selecionarPorIdoso(idIdoso);
  }

  async selecionarPorCuidador(idCuidador: string) {
    return await this._repository.selecionarPorCuidador(idCuidador);
  }

  async criar(
    emailIdoso: string,
    idCuidador: string,
    nome: string,
    intervaloLeituraSeg?: number,
    diasParaExpirar: number = 3,
  ) {
    const idosoExistente = await this._idosoRepository.selecionarPorEmail(emailIdoso);
    if (idosoExistente.length === 0)
      throw new Error("Idoso não encontrado");

    const idoso = idosoExistente[0];

    const solicitacao = SolicitacaoPulseira.criar(
      idoso.id!,
      idCuidador,
      nome,
      intervaloLeituraSeg ?? null,
      diasParaExpirar,
    );

    return await this._repository.criar({
      idIdoso: solicitacao.IdIdoso,
      idCuidador: solicitacao.IdCuidador,
      nome: solicitacao.Nome,
      intervaloLeituraSeg: solicitacao.IntervaloLeituraSeg,
      status: solicitacao.Status,
      expiraEm: solicitacao.ExpiraEm,
    });
  }

  async editar(
    id: string,
    idIdoso: string,
    idCuidador: string,
    nome: string,
    intervaloLeituraSeg: number | null,
    status: StatusSolicitacao,
    expiraEm: Date,
  ) {
    const solicitacaoExistente = await this._repository.selecionarPorId(id);
    if (solicitacaoExistente.length === 0)
      throw new Error("Solicitação não encontrada");

    const idosoExistente = await this._idosoRepository.selecionarPorId(idIdoso);
    if (idosoExistente.length === 0)
      throw new Error("Idoso não encontrado");

    const solicitacao = SolicitacaoPulseira.editar(
      id,
      idIdoso,
      idCuidador,
      nome,
      intervaloLeituraSeg ?? null,
      status,
      expiraEm,
    );

    return await this._repository.editar(id, {
      idIdoso: solicitacao.IdIdoso,
      idCuidador: solicitacao.IdCuidador,
      nome: solicitacao.Nome,
      intervaloLeituraSeg: solicitacao.IntervaloLeituraSeg,
      status: solicitacao.Status,
      expiraEm: solicitacao.ExpiraEm,
    });
  }

  async deletar(id: string) {
    const solicitacaoExistente = await this._repository.selecionarPorId(id);
    if (solicitacaoExistente.length === 0)
      throw new Error("Solicitação não encontrada");

    return await this._repository.deletar(id);
  }

  // Igual ao SolicitacaoCuidador: aceita e depois roda o criar do outro service.
  // Aqui o criar é o da pulseira (o mesmo do POST /pulseira), com o token do middleware.
  async aceitar(id: string, deviceToken: string) {
    const solicitacaoExistente = await this._repository.selecionarPorId(id);
    if (solicitacaoExistente.length === 0)
      throw new Error("Solicitação não encontrada");

    const solicitacao = solicitacaoExistente[0] as any;

    const resultado = await this._repository.aceitar(id);

    const idIdoso = solicitacao.idIdoso || solicitacao.id_idoso;
    const idCuidador = solicitacao.idCuidador || solicitacao.id_cuidador;
    const nome = solicitacao.nome;
    const intervaloLeituraSeg =
      solicitacao.intervaloLeituraSeg ?? solicitacao.intervalo_leitura_seg ?? undefined;

    try {
      const pulseira = await this._pulseiraService.criar(
        idIdoso,
        idCuidador,
        nome,
        deviceToken,
        intervaloLeituraSeg,
      );
      return { ...resultado, pulseira };
    } catch (error) {
      // Se a pulseira não foi criada, a solicitação continua PENDENTE
      await this._repository.voltarParaPendente(id);
      throw error;
    }
  }

  async recusar(id: string) {
    const solicitacaoExistente = await this._repository.selecionarPorId(id);
    if (solicitacaoExistente.length === 0)
      throw new Error("Solicitação não encontrada");

    return await this._repository.recusar(id);
  }

  async cancelar(id: string) {
    const solicitacaoExistente = await this._repository.selecionarPorId(id);
    if (solicitacaoExistente.length === 0)
      throw new Error("Solicitação não encontrada");

    return await this._repository.cancelar(id);
  }

  async deletarPorIdoso(idIdoso: string) {
    const solicitacoes = await this._repository.selecionarPorIdoso(idIdoso);

    if (solicitacoes.length === 0)
      throw new Error("Nenhuma solicitação encontrada para este idoso");

    return await this._repository.deletarPorIdoso(idIdoso);
  }
}