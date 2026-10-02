import { useState, useEffect } from "react";
import { addConsulta, updateConsulta } from "../service/idosoApi";

const formVazio = {
  nomeMedico: '',
  localConsulta: '',
  data: '',
  horario: '',
  descricao: '',
  idIdoso: ''
};

export function useAddConsulta(consultaEditando) {
  const [formData, setFormData] = useState(formVazio);

  const [efetuarCadastro, setEfetuarCadastro] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const emEdicao = Boolean(consultaEditando);

  useEffect(() => {
    if (consultaEditando) {
      setFormData({
        nomeMedico: consultaEditando.nome_medico || '',
        localConsulta: consultaEditando.local_consulta || '',
        data: consultaEditando.data || '',
        horario: consultaEditando.horario || '',
        descricao: consultaEditando.descricao || '',
        idIdoso: consultaEditando.id_idoso || ''
      });
    } else {
      setFormData(formVazio);
    }
  }, [consultaEditando]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    if (!efetuarCadastro) return;

    async function salvar() {
      if (!formData.idIdoso) {
        setErro("Selecione o idoso para o qual a consulta será cadastrada.");
        setEfetuarCadastro(false);
        return;
      }

      setLoading(true);
      setErro(null);

      try {
        if (emEdicao) {
          await updateConsulta(consultaEditando.id, formData);
        } else {
          await addConsulta(formData);
        }

        setSucesso(true);
      } catch (error) {
        console.error("Erro no cadastro:", error);

        setErro(
          error.response?.data?.message ||
          (emEdicao
            ? "Falha ao atualizar consulta"
            : "Falha ao cadastrar nova consulta")
        );
      } finally {
        setLoading(false);
        setEfetuarCadastro(false);
      }
    }

    salvar();
  }, [efetuarCadastro, formData, emEdicao, consultaEditando]);

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