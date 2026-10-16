import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { getCuidadores } from "../service/userApi";

// Descobre o id da tabela "cuidador" a partir do usuário logado (user.id = id_usuario).
export function useCuidadorLogado() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [cuidadorId, setCuidadorId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.id) {
      setCuidadorId(null);
      setLoading(false);
      return;
    }

    async function buscar() {
      try {
        setLoading(true);
        const lista = await getCuidadores();

        const registro = lista.find(
          (c) => String(c.id_usuario ?? c.idUsuario) === String(user.id)
        );

        setCuidadorId(registro?.id ?? null);
      } catch (e) {
        console.error("Erro ao buscar cuidador logado:", e);
        setCuidadorId(null);
      } finally {
        setLoading(false);
      }
    }

    buscar();
  }, [user?.id, authLoading]);

  return { cuidadorId, loading: authLoading || loading };
}
