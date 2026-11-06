import { useEffect, useState } from "react";
import { criarSolicitacaoCuidador } from "../service/solicitacaoApi";
import { useCuidadorLogado } from "./useCuidadorLogado";

const formVazio = {
  emailIdoso: '',
  contatoEmergencia: ''
};

export function useAdicionarIdoso() {
  const { cuidadorId, loading: loadingCuidador } = useCuidadorLogado();
  const [formData, setFormData] = useState(formVazio);

  const [efetuarCadastro, setEfetuarCadastro] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!efetuarCadastro) return;

    async function salvar() {
      if (loadingCuidador) {
        setErro("Aguarde, carregando seus dados de cuidador...");
        setEfetuarCadastro(false);
        return;
      }

      if (!cuidadorId) {
        setErro("Você precisa estar logado como cuidador para adicionar um idoso.");
        setEfetuarCadastro(false);
        return;
      }

      setLoading(true);
      setErro(null);
      setSucesso(false);

      try {
        await criarSolicitacaoCuidador({
          emailIdoso: formData.emailIdoso,
          idCuidador: cuidadorId, // id da tabela "cuidador", não do usuário
          contatoEmergencia: formData.contatoEmergencia,
          diasParaExpirar: 3
        });
        setSucesso(true);
        setFormData(formVazio);
      } catch (error) {
        console.error("Erro ao adicionar idoso:", error);
        setErro(
          error.response?.data?.errorMessage ||
          error.response?.data?.message ||
          "Falha ao enviar solicitação."
        );
      } finally {
        setLoading(false);
        setEfetuarCadastro(false);
      }
    }

    salvar();
  }, [efetuarCadastro, formData, cuidadorId, loadingCuidador]);

  return {
    formData,
    handleChange,
    setEfetuarCadastro,
    sucesso,
    setSucesso,
    loading,
    erro,
    setErro
  };
}
