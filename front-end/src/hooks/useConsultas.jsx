import { useEffect, useState } from "react";
import { getConsultas } from "../service/idosoApi";

export function useConsultas() {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function carregarConsultas() {
      try {
        const data = await getConsultas();
        setConsultas(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    carregarConsultas();
  }, []);

  return { consultas, loading, error };
}