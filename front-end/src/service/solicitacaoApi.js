import { api_auth } from "./api";

export async function getNotificacoesIdoso(idIdoso) {
  const resposta = await api_auth.get(`/solicitacaoCuidador/idoso/${idIdoso}`);
  return resposta.data.result ?? resposta.data;
}

export async function aceitarSolicitacao(id) {
  const resposta = await api_auth.patch(`/solicitacaoCuidador/${id}/aceitar`);
  return resposta.data;
}

export async function recusarSolicitacao(id) {
  const resposta = await api_auth.patch(`/solicitacaoCuidador/${id}/recusar`);
  return resposta.data;
}

export async function cancelarSolicitacao(id) {
  const resposta = await api_auth.patch(`/solicitacaoCuidador/${id}/cancelar`);
  return resposta.data;
}

export async function limparSolicitacoesIdoso(idIdoso) {
  const resposta = await api_auth.delete(`/solicitacaoCuidador/idoso/limpar/${idIdoso}`);
  return resposta.data;
}