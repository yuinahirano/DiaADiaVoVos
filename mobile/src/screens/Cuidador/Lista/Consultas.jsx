import React from 'react';
import { listarConsultasDoIdosoVinculado } from '../../../services/api/apiCuidador';
import { formatarHorario } from '../../../utils/avisosIdoso';
import {
  formatarData,
  lerConsulta,
  ordenarConsultas,
  statusDaConsulta,
} from '../../../utils/dadosIdoso';
import { CardItem, Linha, campoParaIso, horaParaCampo, isoParaCampo } from '../../../utils/crudCuidadorIdoso';

// Card de cada consulta na lista
function ItemConsulta({
  item,
  styles,
  cores,
  agora,
  onEditar,
  onExcluir,
  onCompareceu,
}) {
  const c = lerConsulta(item);
  const status = statusDaConsulta(c, agora);
  const hora = formatarHorario(c.horario);

  const corDaConsulta = {
    compareceu: cores.cards[4],
    agendada: cores.cards[0],
    faltou: cores.cards[3],
  }[status.chave];

  return (
    <CardItem
      styles={styles}
      cor={corDaConsulta}
      icone={consultas.icone}
      titulo={c.medico || 'Consulta'}
      acaoExtra={
        status.chave === 'compareceu'
          ? null
          : {
              texto: 'Compareceu',
              icone: 'check-circle-outline',
              onPress: onCompareceu,
            }
      }
      onEditar={onEditar}
      onExcluir={onExcluir}
    >
      <Linha
        styles={styles}
        icone="calendar-month-outline"
        texto={`${formatarData(c.data)}${hora ? ` · ${hora}` : ''}`}
      />
      <Linha styles={styles} icone="map-marker-outline" texto={c.local} />
      <Linha styles={styles} icone={status.icone} texto={status.texto} forte />
      <Linha styles={styles} icone="note-text-outline" texto={c.descricao} />
    </CardItem>
  );
}

// Configuração de consultas: listar, adicionar, editar e excluir
const consultas = {
  // Lista
  titulo: 'Consultas',
  icone: 'calendar-check-outline',
  iconeVazio: 'calendar-blank-outline',
  textoVazio: 'Nenhuma consulta cadastrada.',
  textoErro: 'Não foi possível carregar as consultas.',
  buscar: (idoso) => listarConsultasDoIdosoVinculado(idoso.id),
  ordenar: (lista, agora) => ordenarConsultas(lista, agora),
  Item: ItemConsulta,

  // Textos de adicionar, editar e excluir
  nomeItem: 'consulta',
  este: 'esta',
  genero: 'a',
  textoAdicionar: 'Adicionar consulta',
  tituloNovo: 'Nova consulta',
  tituloEditar: 'Editar consulta',
  textoCriado: 'Consulta adicionada.',
  textoEditado: 'Consulta atualizada.',
  textoExcluido: 'Consulta excluída.',

  // Formulário
  obrigatorios: ['medico', 'data', 'horario'],
  campos: [
    { chave: 'medico', rotulo: 'Médico', placeholder: 'Nome do médico' },
    {
      chave: 'data',
      rotulo: 'Data',
      placeholder: 'DD/MM/AAAA',
      teclado: 'number-pad',
      mascara: 'data',
      maxLength: 10,
    },
    {
      chave: 'horario',
      rotulo: 'Horário',
      placeholder: 'HH:MM',
      teclado: 'number-pad',
      mascara: 'hora',
      maxLength: 5,
    },
    { chave: 'local', rotulo: 'Local', placeholder: 'Onde será a consulta' },
    {
      chave: 'descricao',
      rotulo: 'Observações',
      placeholder: 'Anotações (opcional)',
      multiline: true,
    },
  ],

  // Item da lista -> valores do formulário (editar)
  paraForm: (item) => {
    const c = lerConsulta(item);

    return {
      medico: c.medico ?? '',
      data: isoParaCampo(c.data),
      horario: horaParaCampo(c.horario),
      local: c.local ?? '',
      descricao: c.descricao ?? '',
    };
  },

  // Valores do formulário -> corpo enviado ao back
  paraCorpo: (v, idoso) => ({
    nomeMedico: v.medico.trim(),
    data: campoParaIso(v.data),
    horario: `${v.horario}:00`,
    localConsulta: v.local.trim(),
    descricao: v.descricao.trim(),
    idIdoso: idoso.id,
  }),

  // Nome mostrado na confirmação de exclusão
  nomeDoItem: (item) => lerConsulta(item).medico || 'a consulta',
};

export default consultas;