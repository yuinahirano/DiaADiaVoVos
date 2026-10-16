import React from 'react';
import { listarMedicamentosDoIdosoVinculado } from '../../../services/api/apiCuidador';
import { formatarHorario } from '../../../utils/avisosIdoso';
import { CardItem, Linha, horaParaCampo } from '../../../utils/crudCuidadorIdoso';

// Card de cada medicamento na lista
function ItemMedicamento({ item, styles, cores, onEditar, onExcluir }) {
  return (
    <CardItem
      styles={styles}
      cor={cores.cards[2]}
      icone={medicamentos.icone}
      titulo={item.nome}
      onEditar={onEditar}
      onExcluir={onExcluir}
    >
      <Linha styles={styles} icone="eyedropper-variant" texto={item.dosagem} />
      <Linha
        styles={styles}
        icone="clock-outline"
        texto={formatarHorario(item.horario)}
      />
      <Linha styles={styles} icone="repeat" texto={item.frequencia} />
      <Linha
        styles={styles}
        icone="note-text-outline"
        texto={item.observacoes}
      />
    </CardItem>
  );
}

// Configuração de medicamentos: listar, adicionar, editar e excluir
const medicamentos = {
  // Lista
  titulo: 'Medicamentos',
  icone: 'pill',
  iconeVazio: 'pill-off',
  textoVazio: 'Nenhum medicamento cadastrado.',
  textoErro: 'Não foi possível carregar os medicamentos.',
  buscar: (idoso) => listarMedicamentosDoIdosoVinculado(idoso.id),
  Item: ItemMedicamento,

  // Textos de adicionar, editar e excluir
  nomeItem: 'medicamento',
  este: 'este',
  genero: 'o',
  textoAdicionar: 'Adicionar medicamento',
  tituloNovo: 'Novo medicamento',
  tituloEditar: 'Editar medicamento',
  textoCriado: 'Medicamento adicionado.',
  textoEditado: 'Medicamento atualizado.',
  textoExcluido: 'Medicamento excluído.',

  // Formulário
  obrigatorios: ['nome'],
  campos: [
    { chave: 'nome', rotulo: 'Nome', placeholder: 'Nome do medicamento' },
    { chave: 'dosagem', rotulo: 'Dosagem', placeholder: 'Ex.: 500 mg' },
    {
      chave: 'horario',
      rotulo: 'Horário',
      placeholder: 'HH:MM',
      teclado: 'number-pad',
      mascara: 'hora',
      maxLength: 5,
    },
    {
      chave: 'frequencia',
      rotulo: 'Frequência',
      placeholder: 'Ex.: 2 vezes ao dia',
    },
    {
      chave: 'observacoes',
      rotulo: 'Observações',
      placeholder: 'Anotações (opcional)',
      multiline: true,
    },
  ],

  // Item da lista -> valores do formulário (editar)
  paraForm: (item) => ({
    nome: item.nome ?? '',
    dosagem: item.dosagem ?? '',
    horario: horaParaCampo(item.horario),
    frequencia: item.frequencia ?? '',
    observacoes: item.observacoes ?? '',
  }),

  // Valores do formulário -> corpo enviado ao back
  paraCorpo: (v, idoso) => ({
    nome: v.nome.trim(),
    dosagem: v.dosagem.trim(),
    horario: v.horario,
    frequencia: v.frequencia.trim(),
    observacoes: v.observacoes.trim(),
    idIdoso: idoso.id,
  }),

  // Nome mostrado na confirmação de exclusão
  nomeDoItem: (item) => item.nome || 'o medicamento',
};

export default medicamentos;