import { useEffect, useState, useCallback } from "react";
import { getDoencas, deleteDoenca as deleteDoencaApi } from "../service/idosoApi";

export function useDoencas(idosoId) {
  const [doencas, setDoencas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarDoencas = useCallback(async () => {
    if (!idosoId) {
      setDoencas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const todasDoencas = await getDoencas();

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
  }, [idosoId]);

  useEffect(() => {
    carregarDoencas();
  }, [carregarDoencas]);

  const deleteDoenca = useCallback(async (id) => {
    try {
      await deleteDoencaApi(id);
      setDoencas((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Erro ao deletar doença:", err);
      setError(err);
    }
  }, []);

  return { doencas, loading, error, deleteDoenca, refetch: carregarDoencas };
}