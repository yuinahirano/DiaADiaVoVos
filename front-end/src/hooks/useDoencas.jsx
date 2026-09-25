import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { getDoencas, getIdosos } from "../service/idosoApi";

export function useDoencas(idosoId) {
  const { user } = useContext(AuthContext);
  const [doencas, setDoencas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function carregarDoencas() {
      // Se não houver ID do idoso passado ainda, interrompe a busca
      if (!idosoId) {
        setDoencas([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const todasDoencas = await getDoencas();

        // Filtra as doenças associadas ao ID do idoso ativo
        const doencasDoIdoso = todasDoencas.filter(
          (doenca) => String(doenca.id_idoso) === String(idosoId)
        );

        setDoencas(doencasDoIdoso);
      } catch (err) {
        console.error("Erro ao carregar doenças:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    carregarDoencas();
  }, [idosoId]); // Executa novamente sempre que o idoso selecionado mudar

  return { doencas, loading, error };
}