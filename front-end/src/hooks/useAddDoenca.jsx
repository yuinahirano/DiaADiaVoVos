import { useState, useEffect } from "react";
import { addDoenca, updateDoenca } from "../service/idosoApi";

const formVazio = {
  nome: '',
  descricao: '',
  id_idoso: ''
};

export function useAddDoenca(doencaEditando) {
  const [formData, setFormData] = useState(formVazio);

  const [efetuarCadastro, setEfetuarCadastro] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const emEdicao = Boolean(doencaEditando);

  useEffect(() => {
    if (doencaEditando) {
      setFormData({
        nome: doencaEditando.nome || '',
        descricao: doencaEditando.descricao || '',
        id_idoso: doencaEditando.id_idoso || ''
      });
    } else {
      setFormData(formVazio);
    }
  }, [doencaEditando]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!efetuarCadastro) return;

    async function salvar() {
      if (!formData.id_idoso) {
        setErro("Selecione o idoso para o qual a doença será cadastrada.");
        setEfetuarCadastro(false);
        return;
      }

      setLoading(true);
      setErro(null);

      // formato que o backend espera
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao,
        idIdoso: formData.id_idoso
      };

      try {
        if (emEdicao) {
          await updateDoenca(doencaEditando.id, payload);
        } else {
          await addDoenca(payload);
        }
        setSucesso(true);
      } catch (error) {
        console.error("Erro no cadastro:", error.response?.data || error);
        setErro(
          error.response?.data?.message ||
          (emEdicao ? "Falha ao atualizar doença" : "Falha ao cadastrar nova doença")
        );
      } finally {
        setLoading(false);
        setEfetuarCadastro(false);
      }
    }

    salvar();
  }, [efetuarCadastro, formData, emEdicao, doencaEditando]);

  return {
    formData,
    handleChange,
    setEfetuarCadastro,
    sucesso,
    setSucesso,
    loading,
    erro,
    setErro,
    emEdicao
  };
}