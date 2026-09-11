import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { getMedicamentosPorIdoso } from "../service/medicamentoApi";
import { getIdosos } from "../service/idosoApi";

export function useMedicamentosIdoso() {
  const { user } = useContext(AuthContext);
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function carregarMedicamentos() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const idosos = await getIdosos();
        const idosoAtual = idosos.find((idoso) => idoso.id_usuario === user.id);

        if (!idosoAtual) {
          setMedicamentos([]);
          return;
        }

        const data = await getMedicamentosPorIdoso(idosoAtual.id);
        setMedicamentos(data.result ?? data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    carregarMedicamentos();
  }, [user]);

  return { medicamentos, loading, error };
}