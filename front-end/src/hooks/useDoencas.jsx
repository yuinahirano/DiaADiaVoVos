import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { getDoencas, getIdosos } from "../service/idosoApi";

export function useDoencas() {
  const { user } = useContext(AuthContext);
  const [doencas, setDoencas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function carregarDoencas() {
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
          setDoencas([]);
          return;
        }

        const todasDoencas = await getDoencas();
        const doencasDoIdoso = todasDoencas.filter(
          (doenca) => doenca.id_idoso === idosoAtual.id
        );

        setDoencas(doencasDoIdoso);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    carregarDoencas();
  }, [user]);

  return { doencas, loading, error };
}