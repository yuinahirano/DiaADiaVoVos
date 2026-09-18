import { useState, useEffect } from "react";
import { getMeRequest } from "../service/userApi";
import {
  getIdosos,
  getIdosoCuidador,
  getUsuarios,
  getCuidadores,
} from "../service/userApi";

export function useIdososDoCuidador() {
  const [idosos, setIdosos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      setErro(null);
      try {
        const [meData, vinculos, todosIdosos, todosUsuarios, todosCuidadores] =
          await Promise.all([
            getMeRequest(),
            getIdosoCuidador(),
            getIdosos(),
            getUsuarios(),
            getCuidadores(),
          ]);

        // /usuario/me pode vir direto ou dentro de { result: [...] }
        const meObj = meData?.result
          ? Array.isArray(meData.result)
            ? meData.result[0]
            : meData.result
          : meData;

        const idUsuarioLogado = meObj?.id || meObj?.idUsuario || meObj?.id_usuario;

        if (!idUsuarioLogado) {
          setErro("Não foi possível identificar o usuário logado.");
          setIdosos([]);
          return;
        }

        // Descobre o id_cuidador real na tabela 'cuidador'
        const registroCuidador = todosCuidadores.find(
          (c) => String(c.id_usuario ?? c.idUsuario) === String(idUsuarioLogado)
        );

        const meuIdCuidador = registroCuidador?.id;

        if (!meuIdCuidador) {
          setErro("Usuário logado não é um cuidador.");
          setIdosos([]);
          return;
        }

        // 1) vínculos deste cuidador (comparando id_cuidador com id_cuidador)
        const idsIdososVinculados = vinculos
          .filter(
            (v) => String(v.id_cuidador ?? v.idCuidador) === String(meuIdCuidador)
          )
          .map((v) => v.id_idoso ?? v.idIdoso);

        // 2) registros de idoso correspondentes
        const idososVinculados = todosIdosos.filter((idoso) =>
          idsIdososVinculados.map(String).includes(String(idoso.id))
        );

        // 3) nome de cada idoso vem da tabela usuario, via id_usuario
        const idososComNome = idososVinculados.map((idoso) => {
          const usuario = todosUsuarios.find(
            (u) => String(u.id) === String(idoso.id_usuario)
          );
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