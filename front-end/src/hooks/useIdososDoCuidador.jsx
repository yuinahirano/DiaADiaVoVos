import { useState, useEffect } from "react";
import { getMeRequest } from "../service/userApi";
import { getIdosos, getIdosoCuidador, getUsuarios } from "../service/idosoApi";

export function useIdososDoCuidador() {
  const [idosos, setIdosos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      setErro(null);
      try {
        const [meData, relacoes, todosIdosos, todosUsuarios] = await Promise.all([
          getMeRequest(),
          getIdosoCuidador(),
          getIdosos(),
          getUsuarios(),
        ]);

        // /usuario/me também vem como { result: [...] }
        const me = meData.result[0];
        const meuIdCuidador = me.idCuidador;

        if (!meuIdCuidador) {
          setErro("Usuário logado não é um cuidador.");
          setIdosos([]);
          return;
        }

        // 1) vínculos deste cuidador
        const idsIdososVinculados = relacoes
          .filter((v) => v.idCuidador === meuIdCuidador)
          .map((v) => v.idIdoso);

        // 2) registros de idoso correspondentes
        const idososVinculados = todosIdosos.filter((idoso) =>
          idsIdososVinculados.includes(idoso.id)
        );

        // 3) nome de cada idoso vem da tabela usuario, via id_usuario
        const idososComNome = idososVinculados.map((idoso) => {
          const usuario = todosUsuarios.find((u) => u.id === idoso.id_usuario);
          return {
            id: idoso.id,
            nome: usuario ? usuario.nome : "Idoso sem nome cadastrado",
          };
        });

        setIdosos(idososComNome);
      } catch (error) {
        console.error("Erro ao carregar idosos do cuidador:", error);
        setErro("Não foi possível carregar a lista de idosos.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  return { idosos, loading, erro };
}