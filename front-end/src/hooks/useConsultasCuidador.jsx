import { useEffect, useState, useCallback, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { getConsultas, getIdosoCuidador } from "../service/idosoApi";

export function useConsultasCuidador() {
  const { user } = useContext(AuthContext);
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarConsultas = useCallback(async () => {
    if (!user?.id) {
      setConsultas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Busca os vínculos idoso-cuidador para saber quais idosos pertencem a este cuidador
      const vinculos = await getIdosoCuidador();
      const idsIdososDoCuidador = vinculos
        .filter((vinculo) => String(vinculo.id_cuidador) === String(user.id))
        .map((vinculo) => String(vinculo.id_idoso));

      // Busca todas as consultas e filtra só as dos idosos deste cuidador
      const todasConsultas = await getConsultas();
      const consultasDoCuidador = todasConsultas.filter((consulta) =>
        idsIdososDoCuidador.includes(String(consulta.id_idoso))
      );

      setConsultas(consultasDoCuidador);
    } catch (err) {
      console.error("Erro ao carregar consultas do cuidador:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    carregarConsultas();
  }, [carregarConsultas]);

  return { consultas, loading, error, refetch: carregarConsultas };
}