import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import {
  getNotificacoesCuidador,
  cancelarSolicitacao,
} from "../service/solicitacaoApi";

export function useNotificacoesCuidador() {
  const { user } = useContext(AuthContext);
  const idCuidador = user?.idCuidador;

  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!idCuidador) {
      setNotificacoes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getNotificacoesCuidador(idCuidador);
      setNotificacoes(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Erro ao carregar notificações do cuidador:", err);
      setNotificacoes([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [idCuidador]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function cancelar(id) {
    await cancelarSolicitacao(id);
    await refetch();
  }

  return { notificacoes, loading, error, cancelar, refetch };
}