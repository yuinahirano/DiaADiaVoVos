import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { getMedicamentos } from "../service/medicamentoApi";
import { getIdosos, getMeRequest } from "../service/userApi";

export function useMedicamentosIdoso() {
  const { user } = useContext(AuthContext);
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function carregarMedicamentos() {
      try {
        setLoading(true);
        setError(null);

        // 1. Identifica o id do usuário logado (contexto ou API /me)
        let idUsuarioLogado =
          user?.id || user?.idUsuario || user?.id_usuario || user?.sub;

        if (!idUsuarioLogado) {
          const meData = await getMeRequest().catch(() => null);
          const meObj = meData?.result
            ? Array.isArray(meData.result)
              ? meData.result[0]
              : meData.result
            : meData;

          idUsuarioLogado =
            meObj?.id || meObj?.idUsuario || meObj?.id_usuario || meObj?.sub;
        }

        if (!idUsuarioLogado) {
          setError("Não foi possível identificar o usuário logado.");
          setMedicamentos([]);
          return;
        }

        // 2. Acha o registro do idoso SOMENTE pelo id_usuario
        const resIdosos = await getIdosos().catch(() => []);
        const listaIdosos = Array.isArray(resIdosos)
          ? resIdosos
          : resIdosos?.result || [];

        const registroIdoso = listaIdosos.find(
          (i) =>
            String(i.id_usuario ?? i.idUsuario) === String(idUsuarioLogado)
        );

        if (!registroIdoso) {
          setError("Idoso não encontrado.");
          setMedicamentos([]);
          return;
        }

        // 3. Busca e filtra os medicamentos do idoso
        const resMeds = await getMedicamentos();
        const listaMeds = Array.isArray(resMeds)
          ? resMeds
          : resMeds?.result || [];

        const medicamentosDoIdoso = listaMeds.filter(
          (m) => String(m.id_idoso ?? m.idIdoso) === String(registroIdoso.id)
        );

        setMedicamentos(medicamentosDoIdoso);
      } catch (err) {
        setError(err?.message || "Erro ao carregar medicamentos");
        setMedicamentos([]);
      } finally {
        setLoading(false);
      }
    }

    carregarMedicamentos();
  }, [user]);

  return { medicamentos, loading, error };
}
