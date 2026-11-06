import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { listarMedicamentosDoIdosoVinculado } from '../../../services/api/apiCuidador';
import { formatarHorario } from '../../../utils/avisosIdoso';
import { CardItem, Linha, horaParaCampo } from '../../../utils/crudCuidadorIdoso';

// Espelha os enums do back (TipoFrequencia e StatusMedicamento) —
// se os valores do back mudarem, muda só aqui.
const OPCOES_TIPO_FREQUENCIA = [
  { valor: 'vezes_por_dia', rotulo: 'Vezes ao dia' },
  { valor: 'intervalo_horas', rotulo: 'A cada X horas' },
];

const OPCOES_STATUS = [
  { valor: 'ativo', rotulo: 'Ativo' },
  { valor: 'pausado', rotulo: 'Pausado' },
  { valor: 'finalizado', rotulo: 'Finalizado' },
];

// Chips clicáveis para os campos de enum (tipoFrequencia, status),
// direto aqui no arquivo — sem componente separado.
function chips(opcoes, valor, aoMudar, cor) {
  return (
    <View style={estilosChip.linha}>
      {opcoes.map((opcao) => {
        const selecionada = opcao.valor === valor;

        return (
          <Pressable
            key={opcao.valor}
            onPress={() => aoMudar(opcao.valor)}
            accessibilityRole="button"
            accessibilityState={{ selected: selecionada }}
            accessibilityLabel={opcao.rotulo}
            style={[
              estilosChip.chip,
              selecionada && {
                backgroundColor: cor ?? '#C8ACE4',
                borderColor: cor ?? '#C8ACE4',
              },
            ]}
          >
            <Text
              style={[
                estilosChip.chipTexto,
                selecionada && estilosChip.chipTextoSelecionado,
              ]}
            >
              {opcao.rotulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilosChip = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  chipTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },

  chipTextoSelecionado: {
    color: '#000000',
  },
});

// Contador clicável (+ / −) para valorFrequencia, em vez de digitar o número.
// unidade muda o texto ao lado ("vez(es)" ou "hora(s)") conforme tipoFrequencia.
function contador(valor, aoMudar, cor, unidade, min = 1, max = 24) {
  const numero = Number(valor) || min;

  const diminuir = () => {
    if (numero > min) aoMudar(String(numero - 1));
  };

  const aumentar = () => {
    if (numero < max) aoMudar(String(numero + 1));
  };

  return (
    <View style={estilosContador.linha}>
      <Pressable
        onPress={diminuir}
        disabled={numero <= min}
        accessibilityRole="button"
        accessibilityLabel="Diminuir"
        style={[
          estilosContador.botao,
          { borderColor: cor ?? '#C8ACE4' },
          numero <= min && estilosContador.botaoDesabilitado,
        ]}
      >
        <Text style={estilosContador.botaoTexto}>−</Text>
      </Pressable>

      <View style={estilosContador.valorContainer}>
        <Text style={estilosContador.valorTexto}>{numero}</Text>
        {unidade ? (
          <Text style={estilosContador.unidadeTexto}>{unidade}</Text>
        ) : null}
      </View>

      <Pressable
        onPress={aumentar}
        disabled={numero >= max}
        accessibilityRole="button"
        accessibilityLabel="Aumentar"
        style={[
          estilosContador.botao,
          { borderColor: cor ?? '#C8ACE4' },
          numero >= max && estilosContador.botaoDesabilitado,
        ]}
      >
        <Text style={estilosContador.botaoTexto}>+</Text>
      </Pressable>
    </View>
  );
}

const estilosContador = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  botao: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  botaoDesabilitado: {
    opacity: 0.4,
  },

  botaoTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },

  valorContainer: {
    alignItems: 'center',
    minWidth: 70,
  },

  valorTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },

  unidadeTexto: {
    fontSize: 13,
    color: '#555555',
    marginTop: 2,
  },
});

const ROTULO_STATUS = {
  ativo: 'Ativo',
  pausado: 'Pausado',
  finalizado: 'Finalizado',
};

// tipoFrequencia + valorFrequencia -> texto legível no card
function formatarFrequencia(tipoFrequencia, valorFrequencia) {
  const valor = Number(valorFrequencia);
  if (!valor) return '—';

  if (tipoFrequencia === 'intervalo_horas') {
    return valor === 1 ? 'A cada 1 hora' : `A cada ${valor} horas`;
  }

  return valor === 1 ? '1 vez ao dia' : `${valor} vezes ao dia`;
}

// Data/hora do banco -> "dd/mm HH:MM"
function formatarDataHora(valor) {
  if (!valor) return '';

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '';

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const hora = String(data.getHours()).padStart(2, '0');
  const min = String(data.getMinutes()).padStart(2, '0');

  return `${dia}/${mes} ${hora}:${min}`;
}

// Card de cada medicamento na lista
function ItemMedicamento({ item, styles, cores, onEditar, onExcluir }) {
  return (
    <CardItem
      styles={styles}
      cor={cores.cards[2]}
      icone={medicamentos.icone}
      titulo={item.nome}
      selo={ROTULO_STATUS[item.status] ?? item.status}
      onEditar={onEditar}
      onExcluir={onExcluir}
    >
      <Linha styles={styles} icone="eyedropper-variant" texto={item.dosagem} />
      <Linha
        styles={styles}
        icone="clock-outline"
        texto={formatarHorario(item.horario)}
      />
      <Linha
        styles={styles}
        icone="repeat"
        texto={formatarFrequencia(item.tipoFrequencia, item.valorFrequencia)}
      />
      <Linha
        styles={styles}
        icone="clock-alert-outline"
        texto={`Próxima dose: ${formatarDataHora(item.proximoHorario) || '—'}`}
      />
      <Linha
        styles={styles}
        icone="clock-check-outline"
        texto={`Última dose: ${formatarDataHora(item.ultimaDose) || 'Ainda não tomada'}`}
      />
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
  obrigatorios: ['nome', 'horario', 'tipoFrequencia', 'valorFrequencia'],
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
      chave: 'tipoFrequencia',
      rotulo: 'Tipo de frequência',
      // Renderizado como chips clicáveis em vez de texto livre.
      Componente: ({ valor, aoMudar, cor }) =>
        chips(OPCOES_TIPO_FREQUENCIA, valor, aoMudar, cor),
      valorPadrao: 'vezes_por_dia',
    },
    {
      chave: 'valorFrequencia',
      rotulo: 'Valor da frequência',
      // Contador +/- em vez de digitar. "form" é o restante dos valores do
      // formulário, usado aqui só para saber o tipoFrequencia já escolhido
      // e mostrar "vez(es)" ou "hora(s)" ao lado do número.
      Componente: ({ valor, aoMudar, cor, form }) => {
        const intervalo = form?.tipoFrequencia === 'intervalo_horas';
        const numero = Number(valor) || 1;
        const unidade = intervalo
          ? numero === 1
            ? 'hora'
            : 'horas'
          : numero === 1
          ? 'vez ao dia'
          : 'vezes ao dia';

        return contador(valor, aoMudar, cor, unidade, 1, intervalo ? 24 : 12);
      },
      valorPadrao: '1',
    },
    {
      chave: 'status',
      rotulo: 'Status',
      // Esse campo nem aparece no formulário de "Adicionar": na criação o
      // back já define status = "ativo" direto (ver paraCorpo). Só aparece
      // ao editar, e sempre por clique nos chips — nunca digitando.
      somenteEditar: true,
      Componente: ({ valor, aoMudar, cor }) =>
        chips(OPCOES_STATUS, valor, aoMudar, cor),
      valorPadrao: 'ativo',
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
    tipoFrequencia: item.tipoFrequencia ?? 'vezes_por_dia',
    valorFrequencia: item.valorFrequencia != null ? String(item.valorFrequencia) : '',
    status: item.status ?? 'ativo',
    observacoes: item.observacoes ?? '',
  }),

  // Valores do formulário -> corpo enviado ao back
  // (status não é enviado na criação: o back sempre começa como "ativo")
  paraCorpo: (v, idoso) => ({
    nome: v.nome.trim(),
    dosagem: v.dosagem.trim(),
    horario: v.horario,
    tipoFrequencia: v.tipoFrequencia,
    valorFrequencia: Number(v.valorFrequencia),
    status: v.status ?? 'ativo',
    observacoes: v.observacoes.trim(),
    idIdoso: idoso.id,
  }),

  // Nome mostrado na confirmação de exclusão
  nomeDoItem: (item) => item.nome || 'o medicamento',
};

export default medicamentos;