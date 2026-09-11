import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { getConsultas, getIdosos } from "../service/idosoApi";

export function useConsultas() {
  const { user } = useContext(AuthContext);
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function carregarConsultas() {
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
          setConsultas([]);
          return;
        }

        const todasConsultas = await getConsultas();
        const consultasDoIdoso = todasConsultas.filter(
          (consulta) => consulta.id_idoso === idosoAtual.id
        );

        setConsultas(consultasDoIdoso);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    carregarConsultas();
  }, [user]);

  return { consultas, loading, error };
}