import { useState, useEffect } from "react";
import { addMedicamento } from "../service/medicamentoApi";

export function useAddMedicamento() {
  const [formData, setFormData] = useState({
    nome: '',
    dosagem: '',
    horario: '',
    frequencia: '',
    observacoes: '',
    idIdoso: ''
  });

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

    async function cadastrar() {
      if (!formData.idIdoso) {
        setErro("Selecione o idoso para o qual o medicamento será cadastrado.");
        setEfetuarCadastro(false);
        return;
      }

      setLoading(true);
      setErro(false);

      try {
        await addMedicamento(formData);
        setSucesso(true);
      } catch (error) {
        console.error("Erro no cadastro:", error);
        setErro(error.response?.data?.message || "Falha ao cadastrar novo medicamento");
      } finally {
        setLoading(false);
        setEfetuarCadastro(false);
      }
    }

    cadastrar();
  }, [efetuarCadastro, formData]);

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