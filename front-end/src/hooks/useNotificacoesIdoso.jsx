import { useCallback, useEffect, useState } from "react";
import { useIdosoLogado } from "./useIdosoLogado";
import {
  getNotificacoesIdoso,
  aceitarSolicitacao,
  recusarSolicitacao,
  limparSolicitacoesIdoso,
} from "../service/solicitacaoApi";

export function useNotificacoesIdoso() {
  const { idosoId, loading: loadingIdoso } = useIdosoLogado();
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotificacoes = useCallback(async () => {
    if (loadingIdoso) return;

    if (!idosoId) {
      setNotificacoes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getNotificacoesIdoso(idosoId);
      setNotificacoes(result || []);
    } catch (err) {
      setNotificacoes([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [idosoId, loadingIdoso]);

  useEffect(() => {
    fetchNotificacoes();
  }, [fetchNotificacoes]);

  async function aceitar(id) {
    await aceitarSolicitacao(id);
    await fetchNotificacoes();
  }

  async function recusar(id) {
    await recusarSolicitacao(id);
    await fetchNotificacoes();
  }

  async function limparSolicitacoes() {
    if (!idosoId) return;
    await limparSolicitacoesIdoso(idosoId);
    await fetchNotificacoes();
  }

  return { notificacoes, loading, error, aceitar, recusar, limparSolicitacoes };
}
