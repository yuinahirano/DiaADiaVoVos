import { useEffect, useState, useCallback } from "react";
import { getConsultas } from "../service/idosoApi";

export function useConsultas(idosoId) {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarConsultas = useCallback(async () => {
    if (!idosoId) {
      setConsultas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const todasConsultas = await getConsultas();

      const consultasDoIdoso = todasConsultas.filter(
        (consulta) => String(consulta.id_idoso) === String(idosoId)
      );

      setConsultas(consultasDoIdoso);
    } catch (err) {
      console.error("Erro ao carregar consultas:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [idosoId]);

  useEffect(() => {
    carregarConsultas();
  }, [carregarConsultas]);

  return { consultas, loading, error, refetch: carregarConsultas };
}