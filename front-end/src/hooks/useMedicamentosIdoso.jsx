import { useEffect, useState } from "react";
import { getMedicamentos } from "../service/medicamentoApi";

export function useMedicamentosIdoso() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function carregarMedicamentos() {
      try {
        const data = await getMedicamentos();
        setMedicamentos(data.result ?? data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    carregarMedicamentos();
  }, []);

  return { medicamentos, loading, error };
}