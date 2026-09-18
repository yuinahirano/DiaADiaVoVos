import { useEffect, useState } from "react";
import { getRegistroSaude } from "../service/registroSaudeApi";

// Lê os dois nomes possíveis de um campo (com/sem acento, snake/camel)
// para não quebrar se o backend vier com grafia diferente da tabela.
function pegarCampo(registro, ...nomes) {
  for (const nome of nomes) {
    if (registro?.[nome] !== undefined && registro?.[nome] !== null) {
      return registro[nome];
    }
  }
  return null;
}

export function useRegistroSaude() {
  const [registro, setRegistro] = useState(null);
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
          setRegistro(null);
          return;
        }

        const todosRegistros = await getRegistroSaude().catch(() => []);
        const lista = Array.isArray(todosRegistros) ? todosRegistros : [];

        const registrosDoIdoso = lista.filter(
          (r) => String(pegarCampo(r, "id_idoso", "idIdoso")) === String(idosoId)
        );

        if (registrosDoIdoso.length === 0) {
          setRegistro(null);
          return;
        }

        // Pega o registro mais recente pela data_registro
        const maisRecente = registrosDoIdoso.reduce((atual, proximo) => {
          const dataAtual = new Date(pegarCampo(atual, "data_registro", "dataRegistro"));
          const dataProximo = new Date(pegarCampo(proximo, "data_registro", "dataRegistro"));
          return dataProximo > dataAtual ? proximo : atual;
        });

        setRegistro({
          frequenciaCardiaca: pegarCampo(maisRecente, "frequencia_cardiaca", "frequenciaCardiaca"),
          saturacaoSangue: pegarCampo(maisRecente, "saturação_sangue", "saturacao_sangue", "saturacaoSangue"),
          peso: pegarCampo(maisRecente, "peso"),
          dataRegistro: pegarCampo(maisRecente, "data_registro", "dataRegistro"),
        });
      } catch (err) {
        console.error("Erro ao carregar registro de saúde:", err);
        setErro("Não foi possível carregar o registro de saúde.");
        setRegistro(null);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  return { registro, loading, erro };
}