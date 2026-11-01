import { useState, useEffect } from "react";
import { addMedicamento, updateMedicamento } from "../service/medicamentoApi";

// Opções pré-definidas de frequência, batendo com o enum TipoFrequencia
// do backend. Usadas no <select> do formulário, não mais um
// input de número livre.
export const OPCOES_VEZES_POR_DIA = [1, 2, 3, 4, 5, 6, 8, 12];
export const OPCOES_INTERVALO_HORAS = [4, 6, 8, 12, 24, 48, 72];

// BUG corrigido: "frequencia" não existe no backend; o model espera
// tipoFrequencia + valorFrequencia (ver TipoFrequencia enum).
// valorFrequencia já começa com um valor válido (nunca vazio), para
// não cair em "Number('') = 0" e estourar a validação do backend.
const formVazio = {
  nome: '',
  dosagem: '',
  horario: '',
  tipoFrequencia: 'vezes_por_dia',
  valorFrequencia: String(OPCOES_VEZES_POR_DIA[0]),
  observacoes: '',
  idIdoso: '',
  status: 'ativo'
};

// A coluna "horario" é TIME no banco e volta como "HH:mm:ss"
// (ex: "08:00:00"). O backend valida estritamente "HH:mm", então
// qualquer valor com segundos precisa ser cortado antes de usar
// tanto no <input type="time"> quanto no payload enviado.
function paraHHmm(horario) {
  if (!horario) return '';
  return String(horario).slice(0, 5);
}

// Garante que, ao trocar o tipo de frequência, valorFrequencia sempre
// tenha uma opção válida pré-selecionada daquele tipo.
function opcoesParaTipo(tipoFrequencia) {
  return tipoFrequencia === 'intervalo_horas'
    ? OPCOES_INTERVALO_HORAS
    : OPCOES_VEZES_POR_DIA;
}

export function useAddMedicamento(medicamentoEditando) {
  const [formData, setFormData] = useState(formVazio);

  const [efetuarCadastro, setEfetuarCadastro] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const emEdicao = Boolean(medicamentoEditando);

  // Preenche o formulário em modo edição.
  // Em modo cadastro, já preenche o idoso com o idoso selecionado na home do cuidador
  // (o select do idoso está desabilitado, então o usuário não consegue escolher).
  useEffect(() => {
    if (medicamentoEditando) {
      const tipoFrequencia = medicamentoEditando.tipoFrequencia || 'vezes_por_dia';
      const opcoes = opcoesParaTipo(tipoFrequencia);
      const valorExistente = Number(medicamentoEditando.valorFrequencia);
      const valorFrequencia = opcoes.includes(valorExistente)
        ? String(valorExistente)
        : String(opcoes[0]);

      setFormData({
        nome: medicamentoEditando.nome || '',
        dosagem: medicamentoEditando.dosagem || '',
        // BUG corrigido: antes mandava o valor cru do banco
        // ("08:00:00"), agora corta pra "HH:mm"
        horario: paraHHmm(medicamentoEditando.horario),
        tipoFrequencia,
        valorFrequencia,
        observacoes: medicamentoEditando.observacoes || '',
        idIdoso: medicamentoEditando.id_idoso ?? medicamentoEditando.idIdoso ?? '',
        status: medicamentoEditando.status || 'ativo'
      });
    } else {
      setFormData({
        ...formVazio,
        idIdoso: localStorage.getItem("idosoSelecionadoId") || ''
      });
    }
  }, [medicamentoEditando]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      // Ao trocar o tipo de frequência, reseta valorFrequencia para
      // a primeira opção válida daquele tipo (nunca deixa um valor
      // de "vezes por dia" sobrando quando muda pra "intervalo de horas")
      if (name === 'tipoFrequencia') {
        const opcoes = opcoesParaTipo(value);
        return { ...prev, tipoFrequencia: value, valorFrequencia: String(opcoes[0]) };
      }
      return { ...prev, [name]: value };
    });
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
      setErro(null);

      const payload = {
        ...formData,
        horario: paraHHmm(formData.horario),
        valorFrequencia: Number(formData.valorFrequencia)
      };

      try {
        if (emEdicao) {
          await updateMedicamento(medicamentoEditando.id, payload);
        } else {
          await addMedicamento(payload);
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