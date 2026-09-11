import { SolicitacaoCuidador } from "../models/solicitacaoRelacionamento.model";
import { SolicitacaoCuidadorRepository } from "../repository/solicitacaoRelacionamento.repository";
import { IdosoRepository } from "../repository/idoso.repository";
import { StatusSolicitacao } from "../enums/statusSolicitacao.enums";
import { IdosoCuidadorService } from "./idosoCuidador.services";

export class SolicitacaoCuidadorService {
  constructor(
    private _repository = new SolicitacaoCuidadorRepository(),
    private _idosoRepository = new IdosoRepository(),
    private _idosoCuidadorService = new IdosoCuidadorService(),
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
    contatoEmergencia: string,
    diasParaExpirar: number = 3,
  ) {
    const idosoExistente = await this._idosoRepository.selecionarPorEmail(emailIdoso);
    if (idosoExistente.length === 0)
      throw new Error("Idoso não encontrado");

    const idoso = idosoExistente[0];

    const solicitacao = SolicitacaoCuidador.criar(
      idoso.id!,
      idCuidador,
      contatoEmergencia,
      diasParaExpirar,
    );

    return await this._repository.criar({
      idIdoso: solicitacao.IdIdoso,
      idCuidador: solicitacao.IdCuidador,
      status: solicitacao.Status,
      expiraEm: solicitacao.ExpiraEm,
      contatoEmergencia: solicitacao.ContatoEmergencia,
    });
  }

  async editar(
    id: string,
    idIdoso: string,
    idCuidador: string,
    status: StatusSolicitacao,
    expiraEm: Date,
    contatoEmergencia: string,
  ) {
    const solicitacaoExistente = await this._repository.selecionarPorId(id);
    if (solicitacaoExistente.length === 0)
      throw new Error("Solicitação não encontrada");

    const idosoExistente = await this._idosoRepository.selecionarPorId(idIdoso);
    if (idosoExistente.length === 0)
      throw new Error("Idoso não encontrado");

    const solicitacao = SolicitacaoCuidador.editar(
      id,
      idIdoso,
      idCuidador,
      status,
      expiraEm,
      contatoEmergencia,
    );

    return await this._repository.editar(id, {
      idIdoso: solicitacao.IdIdoso,
      idCuidador: solicitacao.IdCuidador,
      status: solicitacao.Status,
      expiraEm: solicitacao.ExpiraEm,
      contatoEmergencia: solicitacao.ContatoEmergencia,
    });
  }

  async deletar(id: string) {
    const solicitacaoExistente = await this._repository.selecionarPorId(id);
    if (solicitacaoExistente.length === 0)
      throw new Error("Solicitação não encontrada");

    return await this._repository.deletar(id);
  }

  async aceitar(id: string) {
    const solicitacaoExistente = await this._repository.selecionarPorId(id);
    if (solicitacaoExistente.length === 0)
      throw new Error("Solicitação não encontrada");

    const solicitacao = solicitacaoExistente[0] as any;

    const resultado = await this._repository.aceitar(id);

    const idIdoso = solicitacao.idIdoso || solicitacao.id_idoso;
    const idCuidador = solicitacao.idCuidador || solicitacao.id_cuidador;
    const contatoEmergencia =
      solicitacao.contatoEmergencia || solicitacao.contato_emergencia;

    await this._idosoCuidadorService.criar(
      idIdoso,
      idCuidador,
      contatoEmergencia,
    );

    return resultado;
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