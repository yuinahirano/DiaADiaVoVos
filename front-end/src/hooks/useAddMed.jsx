import { useState, useEffect } from 'react';
import {
  addMedicamento,
  updateMedicamento,
} from '../service/medicamentoApi';

const formVazio = {
  nome: '',
  dosagem: '',
  horario: '',
  tipoFrequencia: 'vezes_por_dia',
  valorFrequencia: '1',
  status: 'ativo',
  observacoes: '',
  idIdoso: '',
};

const paraHoraInput = (valor) => {
  if (!valor) return '';
  return String(valor).slice(0, 5);
};

export function useAddMedicamento(medicamentoEditando) {
  const [formData, setFormData] = useState(formVazio);
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const emEdicao = Boolean(medicamentoEditando);

  useEffect(() => {
    if (medicamentoEditando) {
      setFormData({
        nome: medicamentoEditando.nome || '',
        dosagem: medicamentoEditando.dosagem || '',
        horario: paraHoraInput(medicamentoEditando.horario),
        tipoFrequencia:
          medicamentoEditando.tipoFrequencia || 'vezes_por_dia',
        valorFrequencia: String(
          medicamentoEditando.valorFrequencia ?? 1
        ),
        status: medicamentoEditando.status
          ? String(medicamentoEditando.status).toLowerCase()
          : 'ativo',
        observacoes: medicamentoEditando.observacoes || '',
        idIdoso: String(
          medicamentoEditando.idIdoso ??
          medicamentoEditando.id_idoso ??
          ''
        ),
      });
    } else {
      setFormData({
        ...formVazio,
        idIdoso: localStorage.getItem('idosoSelecionadoId') || '',
      });
    }
  }, [medicamentoEditando]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const salvarMedicamento = async () => {
    if (loading) return;

    setErro(null);

    const nome = formData.nome.trim();
    const dosagem = formData.dosagem.trim();
    const horario = formData.horario;
    const observacoes = formData.observacoes.trim();
    const valorFrequencia = Number(formData.valorFrequencia);
    const idIdoso = String(formData.idIdoso || '');

    if (!idIdoso) {
      setErro('Selecione o idoso para o qual o medicamento será cadastrado.');
      return;
    }

    if (!nome || !dosagem || !horario) {
      setErro('Preencha o nome, a dosagem e o horário.');
      return;
    }

    if (nome.length < 3 || nome.length > 100) {
      setErro('O nome deve ter entre 3 e 100 caracteres.');
      return;
    }

    if (dosagem.length < 3 || dosagem.length > 50) {
      setErro('A dosagem deve ter entre 3 e 50 caracteres.');
      return;
    }

    if (observacoes.length > 100) {
      setErro('As observações devem ter no máximo 100 caracteres.');
      return;
    }

    if (!Number.isInteger(valorFrequencia) || valorFrequencia < 1) {
      setErro('Informe uma frequência inteira maior que zero.');
      return;
    }

    if (
      formData.tipoFrequencia === 'vezes_por_dia' &&
      valorFrequencia > 24
    ) {
      setErro('A frequência por dia não pode ser maior que 24.');
      return;
    }

    if (
      formData.tipoFrequencia === 'intervalo_horas' &&
      valorFrequencia > 168
    ) {
      setErro('O intervalo não pode ser maior que 168 horas.');
      return;
    }

    if (
      !['vezes_por_dia', 'intervalo_horas'].includes(
        formData.tipoFrequencia
      )
    ) {
      setErro('Selecione um tipo de frequência válido.');
      return;
    }

    const statusPermitidos = ['ativo', 'pausado', 'finalizado'];

    if (
      emEdicao &&
      !statusPermitidos.includes(formData.status)
    ) {
      setErro('Selecione um status válido.');
      return;
    }

    const payload = {
      nome,
      dosagem,
      horario,
      tipoFrequencia: formData.tipoFrequencia,
      valorFrequencia,
      idIdoso,
      observacoes: observacoes || undefined,
      ...(emEdicao ? { status: formData.status } : {}),
    };

    try {
      setLoading(true);

      if (emEdicao) {
        if (!medicamentoEditando?.id) {
          throw new Error('Não foi possível identificar o medicamento.');
        }

        await updateMedicamento(medicamentoEditando.id, payload);
      } else {
        await addMedicamento(payload);
      }

      setSucesso(true);
    } catch (error) {
      console.error('Erro ao salvar medicamento:', error);

      setErro(
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        error.message ||
        (emEdicao
          ? 'Falha ao atualizar medicamento.'
          : 'Falha ao cadastrar medicamento.')
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    salvarMedicamento,
    sucesso,
    setSucesso,
    loading,
    erro,
    setErro,
    emEdicao,
  };
}