import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { getIdosos } from "../service/userApi";

// Descobre o id da tabela "idoso" a partir do usuário logado.
// O AuthContext só expõe o id da tabela "usuario" (user.id), por isso
// precisamos procurar em /idosos o registro cujo id_usuario bate com ele.
export function useIdosoLogado() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [idosoId, setIdosoId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // espera o AuthContext terminar de carregar o usuário
    if (authLoading) return;

    if (!user?.id) {
      setIdosoId(null);
      setLoading(false);
      return;
    }

    async function buscar() {
      try {
        setLoading(true);
        const lista = await getIdosos();

        const registro = lista.find(
          (i) => String(i.id_usuario ?? i.idUsuario) === String(user.id)
        );

        setIdosoId(registro?.id ?? null);
      } catch (e) {
        console.error("Erro ao buscar idoso logado:", e);
        setIdosoId(null);
      } finally {
        setLoading(false);
      }
    }

    buscar();
  }, [user?.id, authLoading]);

  return { idosoId, loading: authLoading || loading };
}
