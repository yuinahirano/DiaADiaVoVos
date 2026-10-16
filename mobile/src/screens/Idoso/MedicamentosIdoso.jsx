import React, { useCallback, useEffect, useState } from 'react';
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
import { listarMedicamentosDoIdoso } from '../../services/api/apiIdoso';

// "10:00:00" -> "10:00"
function formatarHorario(horario) {
  const texto = String(horario ?? '').trim();

  if (/^\d{2}:\d{2}/.test(texto)) {
    return texto.slice(0, 5);
  }

  return texto;
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

export default function MedicamentosIdoso() {
  const navigation = useNavigation();

  const [medicamentos, setMedicamentos] = useState([]);
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
      const lista = await listarMedicamentosDoIdoso();
      setMedicamentos(lista);
    } catch (e) {
      setErro(e?.message || 'Não foi possível carregar os medicamentos.');
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

  // O card não tem altura fixa: cresce conforme o texto de cada campo,
  // e todo texto quebra de linha dentro da sua própria área.
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTopo}>
        <View style={styles.cardIcone}>
          <MaterialCommunityIcons name="pill" size={34} color="#000000" />
        </View>

        <Text style={styles.cardTitulo}>{item.nome}</Text>
      </View>

      <View style={styles.campos}>
        <Campo icone="eyedropper-variant" rotulo="Dosagem" valor={item.dosagem} />

        <Campo
          icone="clock-outline"
          rotulo="Horário"
          valor={formatarHorario(item.horario)}
        />

        <Campo
          icone="repeat"
          rotulo="Frequência"
          valor={item.frequencia}
        />
      </View>

      {item.observacoes ? (
        <View style={styles.observacoes}>
          <View style={styles.campoRotuloLinha}>
            <MaterialCommunityIcons
              name="note-text-outline"
              size={18}
              color="#000000"
            />
            <Text style={styles.campoRotulo}>Observações</Text>
          </View>

          <Text style={styles.campoValor}>{item.observacoes}</Text>
        </View>
      ) : null}
    </View>
  );

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
          name="pill-off"
          size={56}
          color="#000000"
        />

        <Text style={styles.estadoTexto}>
          Nenhum medicamento cadastrado.
        </Text>
      </View>
    );
  };

  // Primeiro carregamento: esqueleto no lugar do círculo girando
  if (carregando) {
    return (
      <SkeletonTela rotulo="Carregando medicamentos">
        <SkeletonCabecalho />
        <SkeletonLista tipo="campos" quantidade={3} />
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
          <Text style={styles.titulo}>Medicamentos</Text>

          <Text style={styles.subtitulo}>
            Seus remédios e horários
          </Text>
        </View>
      </View>

      <FlatList
        data={medicamentos}
        keyExtractor={(item, index) =>
          String(item.id ?? `${item.nome}-${index}`)
        }
        renderItem={renderItem}
        ListEmptyComponent={renderVazio}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => carregar(true)}
            colors={['#C8ACE4']}
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

  // Sem altura fixa: o card acompanha o tamanho do conteúdo
  card: {
    backgroundColor: '#C8ACE4',
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
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitulo: {
    flex: 1,
    flexShrink: 1,
    color: '#000000',
    fontSize: 22,
    fontWeight: 'bold',
  },

  // Cada campo ocupa metade da linha (ou a linha toda se não couber)
  // e o texto quebra dentro dele, então nada se sobrepõe.
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
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
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

  observacoes: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
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