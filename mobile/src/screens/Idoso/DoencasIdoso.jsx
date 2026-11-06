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
import { listarDoencasDoIdoso } from '../../services/api/apiIdoso';

export default function DoencasIdoso() {
  const navigation = useNavigation();

  const [doencas, setDoencas] = useState([]);
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
      const lista = await listarDoencasDoIdoso();
      setDoencas(lista);
    } catch (e) {
      setErro(e?.message || 'Não foi possível carregar as doenças.');
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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardIcone}>
        <MaterialCommunityIcons
          name="clipboard-pulse-outline"
          size={34}
          color="#000000"
        />
      </View>

      <View style={styles.cardConteudo}>
        <Text style={styles.cardTitulo}>{item.nome}</Text>

        <Text style={styles.cardDescricao}>
          {item.descricao || 'Sem descrição.'}
        </Text>
      </View>
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
          name="clipboard-text-off-outline"
          size={56}
          color="#000000"
        />

        <Text style={styles.estadoTexto}>
          Nenhuma doença cadastrada.
        </Text>
      </View>
    );
  };

  // Primeiro carregamento: esqueleto no lugar do círculo girando
  if (carregando) {
    return (
      <SkeletonTela rotulo="Carregando doenças">
        <SkeletonCabecalho />
        <SkeletonLista tipo="simples" quantidade={4} />
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
          <Text style={styles.titulo}>Doenças</Text>

          <Text style={styles.subtitulo}>
            Suas condições de saúde
          </Text>
        </View>
      </View>

      <FlatList
        data={doencas}
        keyExtractor={(item, index) => String(item.id ?? `${item.nome}-${index}`)}
        renderItem={renderItem}
        ListEmptyComponent={renderVazio}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => carregar(true)}
            colors={['#F5877E']}
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

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5877E',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    gap: 16,
  },

  cardIcone: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardConteudo: {
    flex: 1,
  },

  cardTitulo: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },

  cardDescricao: {
    color: '#000000',
    fontSize: 16,
    marginTop: 6,
    lineHeight: 22,
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