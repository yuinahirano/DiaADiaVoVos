import { useContext, useEffect, useState } from "react";
import { criarSolicitacaoCuidador } from "../service/solicitacaoApi";
import { AuthContext } from "../contexts/AuthContext";
const formVazio = {
  emailIdoso: '',
  contatoEmergencia: ''
};

export function useAdicionarIdoso() {
  const { user } = useContext(AuthContext);
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
      if (!user?.id) {
        setErro("Você precisa estar logado como cuidador para adicionar um idoso.");
        setEfetuarCadastro(false);
        return;
      }

      setLoading(true);
      setErro(null);

      try {
        await criarSolicitacaoCuidador({
          emailIdoso: formData.emailIdoso,
          idCuidador: user.id,
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
  }, [efetuarCadastro, formData, user]);

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