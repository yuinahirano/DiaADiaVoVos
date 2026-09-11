import { useEffect, useState } from "react";
import { getMedicamentos } from "../service/medicamentoApi";
import { getIdosos, getMeRequest } from "../service/userApi";

export function useMedicamentosIdoso() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function carregarMedicamentos() {
      try {
        setLoading(true);
        setError(null);

        // 1. Descobre o usuário logado
        const meData = await getMeRequest().catch(() => null);
        const meObj = meData?.result
          ? Array.isArray(meData.result)
            ? meData.result[0]
            : meData.result
          : meData;
        const idUsuarioLogado =
          meObj?.id || meObj?.idUsuario || meObj?.id_usuario;

        if (!idUsuarioLogado) {
          setError("Não foi possível identificar o usuário logado.");
          setMedicamentos([]);
          return;
        }

        // 2. Encontra o registro de idoso correspondente a esse usuário
        const todosIdosos = await getIdosos().catch(() => []);
        const registroIdoso = todosIdosos.find(
          (i) => String(i.id_usuario) === String(idUsuarioLogado)
        );

        if (!registroIdoso) {
          setError("Idoso não encontrado.");
          setMedicamentos([]);
          return;
        }

        // 3. Busca todos os medicamentos e filtra só os desse idoso
        const data = await getMedicamentos();
        const todos = data.result ?? data;

        const medicamentosDoIdoso = todos.filter(
          (m) => String(m.id_idoso ?? m.idIdoso) === String(registroIdoso.id)
        );

        setMedicamentos(medicamentosDoIdoso);
      } catch (err) {
        setError(err);
        setMedicamentos([]);
      } finally {
        setLoading(false);
      }
    }

    carregarMedicamentos();
  }, []);

  return { medicamentos, loading, error };
}