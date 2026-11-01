import { useEffect, useState, useCallback } from "react";
import { deleteMedicamentos, getMedicamentos } from "../service/medicamentoApi";

// BUG corrigido: antes o hook não recebia idosoId/ready, lia
// idosoSelecionadoId direto do localStorage e nunca sabia se o
// idoso ainda estava carregando (mesmo bug de timing do useDoencas:
// loading virava false antes da hora). Agora segue o mesmo padrão.
export function useMedicamentos(idosoId, ready = true) {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarMedicamentos = useCallback(async () => {
    // idoso ainda não foi resolvido (useIdosoSelecionado carregando):
    // mantém loading=true, não decide nada ainda
    if (!ready) {
      return;
    }

    // idoso resolvido mas sem id: não tem o que buscar, zera a lista
    if (!idosoId) {
      setMedicamentos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getMedicamentos();
      const todos = data.result ?? data;

      const filtrados = todos.filter(
        (m) => String(m.id_idoso ?? m.idIdoso) === String(idosoId)
      );

      setMedicamentos(filtrados);
    } catch (err) {
      console.error("Erro ao buscar medicamentos:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [idosoId, ready]);

  useEffect(() => {
    carregarMedicamentos();
  }, [carregarMedicamentos]);

  async function deletarMedicamento(id) {
    try {
      await deleteMedicamentos(id);
      setMedicamentos((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Erro ao deletar medicamento:", error);
      throw error;
    }
  }

  return {
    medicamentos,
    loading,
    error,
    deletarMedicamento,
    refetch: carregarMedicamentos,
  };
}