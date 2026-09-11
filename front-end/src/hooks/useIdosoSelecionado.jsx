import { useState, useEffect } from "react";
import { getIdosos, getUsuarios } from "../service/userApi";

export function useIdosoSelecionado() {
  const [idoso, setIdoso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        setErro(null);

        const idosoId = localStorage.getItem("idosoSelecionadoId");

        if (!idosoId) {
          setErro("Nenhum idoso selecionado.");
          setIdoso(null);
          return;
        }

        const [todosIdosos, todosUsuarios] = await Promise.all([
          getIdosos().catch(() => []),
          getUsuarios().catch(() => []),
        ]);

        const registroIdoso = todosIdosos.find(
          (i) => String(i.id) === String(idosoId)
        );

        if (!registroIdoso) {
          setErro("Idoso não encontrado.");
          setIdoso(null);
          return;
        }

        const usuarioIdoso = todosUsuarios.find(
          (u) => String(u.id) === String(registroIdoso.id_usuario)
        );

        setIdoso({
          id: registroIdoso.id,
          nome: usuarioIdoso?.nome || "Idoso",
          tipoSanguineo: registroIdoso.tipo_sanguineo ?? registroIdoso.tipoSanguineo,
          telefone: registroIdoso.telefone,
          pcd: registroIdoso.pcd,
        });
      } catch (err) {
        console.error("Erro ao carregar idoso selecionado:", err);
        setErro("Não foi possível carregar os dados do idoso.");
        setIdoso(null);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  return { idoso, loading, erro };
}   