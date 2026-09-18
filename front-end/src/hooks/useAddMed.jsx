import { useState, useEffect } from "react";
import { addMedicamento, updateMedicamento } from "../service/medicamentoApi";

const formVazio = {
  nome: '',
  dosagem: '',
  horario: '',
  frequencia: '',
  observacoes: '',
  idIdoso: ''
};

export function useAddMedicamento(medicamentoEditando) {
  const [formData, setFormData] = useState(formVazio);

  const [efetuarCadastro, setEfetuarCadastro] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const emEdicao = Boolean(medicamentoEditando);

  // Preenche o formulário quando abrir em modo edição (ou limpa quando for criar)
  useEffect(() => {
    if (medicamentoEditando) {
      setFormData({
        nome: medicamentoEditando.nome || '',
        dosagem: medicamentoEditando.dosagem || '',
        horario: medicamentoEditando.horario || '',
        frequencia: medicamentoEditando.frequencia || '',
        observacoes: medicamentoEditando.observacoes || '',
        idIdoso: medicamentoEditando.id_idoso ?? medicamentoEditando.idIdoso ?? ''
      });
    } else {
      setFormData(formVazio);
    }
  }, [medicamentoEditando]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!efetuarCadastro) return;

    async function salvar() {
      if (!formData.idIdoso) {
        setErro("Selecione o idoso para o qual o medicamento será cadastrado.");
        setEfetuarCadastro(false);
        return;
      }

      setLoading(true);
      setErro(false);

      try {
        if (emEdicao) {
          await updateMedicamento(medicamentoEditando.id, formData);
        } else {
          await addMedicamento(formData);
        }
        setSucesso(true);
      } catch (error) {
        console.error("Erro no cadastro:", error);
        setErro(
          error.response?.data?.message ||
          (emEdicao ? "Falha ao atualizar medicamento" : "Falha ao cadastrar novo medicamento")
        );
      } finally {
        setLoading(false);
        setEfetuarCadastro(false);
      }
    }

    salvar();
  }, [efetuarCadastro, formData, emEdicao, medicamentoEditando]);

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