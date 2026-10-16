import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  SkeletonCabecalho,
  SkeletonLista,
  SkeletonTela,
} from '../../components/Skeleton';
import { listarConsultasDoIdoso } from '../../services/api/apiIdoso';

const doisDigitos = (n) => String(n).padStart(2, '0');

// Extrai { ano, mes, dia } de:
// "2026-10-15", "2026-10-15T00:00:00.000Z" (usa o dia escrito, sem converter fuso)
// ou de uma data com horário (usa o dia local do aparelho).
function partesDaData(valor) {
  const texto = String(valor ?? '').trim();

  if (!texto) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}(T00:00:00(\.0+)?Z)?$/.test(texto)) {
    const [ano, mes, dia] = texto.slice(0, 10).split('-').map(Number);

    return { ano, mes, dia };
  }

  const data = new Date(texto);

  if (Number.isNaN(data.getTime())) {
    return null;
  }

  return {
    ano: data.getFullYear(),
    mes: data.getMonth() + 1,
    dia: data.getDate(),
  };
}

// "2026-10-15" -> "15/10/2026"
function formatarData(valor) {
  const partes = partesDaData(valor);

  if (!partes) {
    return String(valor ?? '').trim();
  }

  return `${doisDigitos(partes.dia)}/${doisDigitos(partes.mes)}/${partes.ano}`;
}

// "14:30:00" -> "14:30"
function formatarHorario(horario) {
  const texto = String(horario ?? '').trim();

  return /^\d{2}:\d{2}/.test(texto) ? texto.slice(0, 5) : texto;
}

// Momento exato da consulta (data + horário). Sem horário, vale o fim do dia.
function momentoDaConsulta(data, horario) {
  const partes = partesDaData(data);

  if (!partes) {
    return null;
  }

  const texto = String(horario ?? '').trim();
  const hora = /^(\d{2}):(\d{2})/.exec(texto);

  const h = hora ? Number(hora[1]) : 23;
  const min = hora ? Number(hora[2]) : 59;

  return new Date(partes.ano, partes.mes - 1, partes.dia, h, min);
}

// Aceita nome_medico ou nomeMedico, etc. (a API devolve as colunas do banco)
function lerCampos(item) {
  const compareceu = item.compareceu;

  return {
    medico: item.nome_medico ?? item.nomeMedico,
    local: item.local_consulta ?? item.localConsulta,
    data: item.data,
    horario: item.horario,
    descricao: item.descricao,
    compareceu:
      compareceu === true || compareceu === 1 || compareceu === '1',
  };
}

// compareceu -> 'compareceu'
// já passou e não foi confirmada -> 'faltou'
// ainda vai acontecer -> 'agendada'
function statusDaConsulta(c, agora) {
  if (c.compareceu) {
    return 'compareceu';
  }

  const momento = momentoDaConsulta(c.data, c.horario);

  if (momento && momento.getTime() < agora) {
    return 'faltou';
  }

  return 'agendada';
}

const STATUS = {
  compareceu: {
    texto: 'Compareceu',
    icone: 'check-circle-outline',
    cor: '#A6D8B7',
  },
  agendada: {
    texto: 'Agendada',
    icone: 'clock-outline',
    cor: '#FFE16A',
  },
  faltou: {
    texto: 'Não compareceu',
    icone: 'close-circle-outline',
    cor: '#F5877E',
  },
};

// Futuras primeiro (da mais próxima para a mais distante),
// depois as que já passaram (da mais recente para a mais antiga).
function ordenarPorData(lista, agora) {
  const comMomento = lista.map((item) => {
    const c = lerCampos(item);
    const momento = momentoDaConsulta(c.data, c.horario);

    return { item, tempo: momento ? momento.getTime() : null };
  });

  const futuras = comMomento
    .filter((x) => x.tempo !== null && x.tempo >= agora)
    .sort((a, b) => a.tempo - b.tempo);

  const passadas = comMomento
    .filter((x) => x.tempo !== null && x.tempo < agora)
    .sort((a, b) => b.tempo - a.tempo);

  const semData = comMomento.filter((x) => x.tempo === null);

  return [...futuras, ...passadas, ...semData].map((x) => x.item);
}

function Campo({ icone, rotulo, valor }) {
  return (
    <View style={styles.campo}>
      <View style={styles.campoRotuloLinha}>
        <MaterialCommunityIcons name={icone} size={18} color="#000000" />
        <Text style={styles.campoRotulo}>{rotulo}</Text>
      </View>

      <Text style={styles.campoValor}>{valor || '—'}</Text>
    </View>
  );
}

export default function ConsultasIdoso() {
  const navigation = useNavigation();

  const [consultas, setConsultas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async (puxando = false) => {
    setErro('');

    if (puxando) {
      setAtualizando(true);
    } else {
      setCarregando(true);
    }

    try {
      const lista = await listarConsultasDoIdoso();
      setConsultas(lista);
    } catch (e) {
      setErro(e?.message || 'Não foi possível carregar as consultas.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const voltar = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // Reordena sempre que a lista muda
  const listaOrdenada = useMemo(
    () => ordenarPorData(consultas, Date.now()),
    [consultas],
  );

  // O card não tem altura fixa: cresce conforme o texto de cada campo,
  // e todo texto quebra de linha dentro da sua própria área.
  const renderItem = ({ item }) => {
    const c = lerCampos(item);
    const status = STATUS[statusDaConsulta(c, Date.now())];

    return (
      <View style={[styles.card, { backgroundColor: status.cor }]}>
        <View style={styles.cardTopo}>
          <View style={styles.cardIcone}>
            <MaterialCommunityIcons
              name="calendar-check-outline"
              size={34}
              color="#000000"
            />
          </View>

          <View style={styles.cardTituloContainer}>
            <Text style={styles.cardTitulo}>
              {c.medico || 'Consulta'}
            </Text>

            <View style={styles.selo}>
              <MaterialCommunityIcons
                name={status.icone}
                size={16}
                color="#000000"
              />

              <Text style={styles.seloTexto}>{status.texto}</Text>
            </View>
          </View>
        </View>

        <View style={styles.campos}>
          <Campo
            icone="calendar-month-outline"
            rotulo="Data"
            valor={formatarData(c.data)}
          />

          <Campo
            icone="clock-outline"
            rotulo="Horário"
            valor={formatarHorario(c.horario)}
          />
        </View>

        <View style={styles.blocoLargo}>
          <View style={styles.campoRotuloLinha}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={18}
              color="#000000"
            />
            <Text style={styles.campoRotulo}>Local</Text>
          </View>

          <Text style={styles.campoValor}>{c.local || '—'}</Text>
        </View>

        {c.descricao ? (
          <View style={styles.blocoLargo}>
            <View style={styles.campoRotuloLinha}>
              <MaterialCommunityIcons
                name="note-text-outline"
                size={18}
                color="#000000"
              />
              <Text style={styles.campoRotulo}>Descrição</Text>
            </View>

            <Text style={styles.campoValor}>{c.descricao}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderVazio = () => {
    if (carregando) {
      return null;
    }

    if (erro) {
      return (
        <View style={styles.estado}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={56}
            color="#000000"
          />

          <Text style={styles.estadoTexto}>{erro}</Text>

          <Pressable
            style={styles.botaoTentar}
            accessibilityRole="button"
            accessibilityLabel="Tentar novamente"
            onPress={() => carregar()}
          >
            <Text style={styles.botaoTentarTexto}>Tentar novamente</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.estado}>
        <MaterialCommunityIcons
          name="calendar-blank-outline"
          size={56}
          color="#000000"
        />

        <Text style={styles.estadoTexto}>
          Nenhuma consulta agendada.
        </Text>
      </View>
    );
  };

  // Primeiro carregamento: esqueleto no lugar do círculo girando
  if (carregando) {
    return (
      <SkeletonTela rotulo="Carregando consultas">
        <SkeletonCabecalho />
        <SkeletonLista quantidade={3} />
      </SkeletonTela>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#EAF1FF" barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable
          style={styles.botaoHeader}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={voltar}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color="#000000"
          />
        </Pressable>

        <View style={styles.tituloContainer}>
          <Text style={styles.titulo}>Consultas</Text>

          <Text style={styles.subtitulo}>
            Suas consultas médicas
          </Text>
        </View>
      </View>

      <FlatList
        data={listaOrdenada}
        keyExtractor={(item, index) =>
          String(item.id ?? `${item.nome_medico}-${index}`)
        }
        renderItem={renderItem}
        ListEmptyComponent={renderVazio}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => carregar(true)}
            colors={['#FFE16A']}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EAF1FF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    marginBottom: 24,
  },

  botaoHeader: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  tituloContainer: {
    flex: 1,
  },

  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000000',
  },

  subtitulo: {
    fontSize: 16,
    color: '#333333',
    marginTop: 6,
  },

  lista: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // Sem altura fixa: o card acompanha o tamanho do conteúdo.
  // A cor de fundo vem do status (verde, amarelo ou rosa).
  card: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },

  cardTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  cardIcone: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTituloContainer: {
    flex: 1,
    flexShrink: 1,
    alignItems: 'flex-start',
    gap: 8,
  },

  cardTitulo: {
    flexShrink: 1,
    color: '#000000',
    fontSize: 22,
    fontWeight: 'bold',
  },

  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },

  seloTexto: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Data e horário dividem a linha; se não couberem, quebram para a linha de baixo
  campos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },

  campo: {
    flexGrow: 1,
    flexBasis: '45%',
    flexShrink: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  campoRotuloLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  campoRotulo: {
    flexShrink: 1,
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },

  campoValor: {
    color: '#000000',
    fontSize: 17,
    lineHeight: 23,
    marginTop: 4,
  },

  blocoLargo: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 10,
  },

  estado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    gap: 14,
  },

  estadoTexto: {
    color: '#333333',
    fontSize: 18,
    textAlign: 'center',
  },

  botaoTentar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 6,
  },

  botaoTentarTexto: {
    color: '#000000',
    fontSize: 17,
    fontWeight: 'bold',
  },
});