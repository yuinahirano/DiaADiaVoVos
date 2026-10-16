import React from 'react';
import { listarDoencasDoIdosoVinculado } from '../../../services/api/apiCuidador';
import { CardItem, Linha } from '../../../utils/crudCuidadorIdoso';

// Card de cada doença na lista
function ItemDoenca({ item, styles, cores, onEditar, onExcluir }) {
  return (
    <CardItem
      styles={styles}
      cor={cores.cards[3]}
      icone={doencas.icone}
      titulo={item.nome}
      onEditar={onEditar}
      onExcluir={onExcluir}
    >
      <Linha
        styles={styles}
        icone="text-box-outline"
        texto={item.descricao || 'Sem descrição.'}
      />
    </CardItem>
  );
}

// Configuração de doenças: listar, adicionar, editar e excluir
const doencas = {
  // Lista
  titulo: 'Doenças',
  icone: 'clipboard-pulse-outline',
  iconeVazio: 'clipboard-text-off-outline',
  textoVazio: 'Nenhuma doença cadastrada.',
  textoErro: 'Não foi possível carregar as doenças.',
  buscar: (idoso) =>
    idoso.id_usuario
      ? listarDoencasDoIdosoVinculado(idoso.id_usuario)
      : Promise.reject(new Error('Id do usuário do idoso não informado')),
  Item: ItemDoenca,

  // Textos de adicionar, editar e excluir
  nomeItem: 'doença',
  este: 'esta',
  genero: 'a',
  textoAdicionar: 'Adicionar doença',
  tituloNovo: 'Nova doença',
  tituloEditar: 'Editar doença',
  textoCriado: 'Doença adicionada.',
  textoEditado: 'Doença atualizada.',
  textoExcluido: 'Doença excluída.',

  // Formulário
  obrigatorios: ['nome'],
  campos: [
    { chave: 'nome', rotulo: 'Nome', placeholder: 'Nome da doença' },
    {
      chave: 'descricao',
      rotulo: 'Descrição',
      placeholder: 'Detalhes (opcional)',
      multiline: true,
    },
  ],

  // Item da lista -> valores do formulário (editar)
  paraForm: (item) => ({
    nome: item.nome ?? '',
    descricao: item.descricao ?? '',
  }),

  // Valores do formulário -> corpo enviado ao back
  paraCorpo: (v, idoso) => ({
    nome: v.nome.trim(),
    descricao: v.descricao.trim(),
    idIdoso: idoso.id,
  }),

  // Nome mostrado na confirmação de exclusão
  nomeDoItem: (item) => item.nome || 'a doença',
};

export default doencas;