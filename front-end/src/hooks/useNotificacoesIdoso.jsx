import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import {
  getNotificacoesIdoso,
  aceitarSolicitacao,
  recusarSolicitacao,
  limparSolicitacoesIdoso
} from "../service/solicitacaoApi";

export function useNotificacoesIdoso() {
  const { user } = useContext(AuthContext);
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchNotificacoes() {
    const idosoId = user?.idIdoso || user?.id;

    if (!idosoId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getNotificacoesIdoso(idosoId);
      setNotificacoes(result || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotificacoes();
  }, [user]);

  async function aceitar(id) {
    await aceitarSolicitacao(id);
    await fetchNotificacoes();
  }

  async function recusar(id) {
    await recusarSolicitacao(id);
    await fetchNotificacoes();
  }

  async function limparSolicitacoes() {
  const idosoId = user?.idIdoso || user?.id;

  if (!idosoId) return;

  await limparSolicitacoesIdoso(idosoId);
  await fetchNotificacoes();
}

  return { notificacoes, loading, error, aceitar, recusar, limparSolicitacoes };
}