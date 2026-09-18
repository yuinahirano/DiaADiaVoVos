import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { getConsultas, getIdosos } from "../service/idosoApi";

export function useConsultas(idosoId) {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function carregarConsultas() {
      // Se não houver ID do idoso passado, encerra o carregamento
      if (!idosoId) {
        setConsultas([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const todasConsultas = await getConsultas();

        // Filtra comparando os IDs como String para evitar incompatibilidade entre número/texto
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
    }

    carregarConsultas();
  }, [idosoId]); // Executa novamente quando o idosoId mudar

  return { consultas, loading, error };
}