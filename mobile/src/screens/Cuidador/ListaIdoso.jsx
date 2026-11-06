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
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AlertaModal, { CORES_ALERTA } from '../../components/AlertaModal';
import FormularioModal from '../../components/FormularioModal';
import { SkeletonBloco } from '../../components/Skeleton';
import { useTema } from '../../contexts/TemaContext';
import { useIdosoSelecionado } from '../../contexts/IdosoSelecionadoContext';
import { useCrudLista } from '../../utils/crudCuidadorIdoso';
import consultas from './Lista/Consultas';
import doencas from './Lista/Doencas';
import medicamentos from './Lista/Medicamentos';

// Configuração de cada tipo de lista, escolhida por route.params.tipo
const TIPOS = { consultas, medicamentos, doencas };

export default function ListaIdoso() {
  const navigation = useNavigation();
  const route = useRoute();
  const { cores } = useTema();
  const { idosoSelecionado } = useIdosoSelecionado();

  const styles = useMemo(() => criarStyles(cores), [cores]);

  const tipo = TIPOS[route.params?.tipo] ? route.params.tipo : 'consultas';
  const config = TIPOS[tipo];

  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(
    async (puxando = false) => {
      setErro('');

      if (!idosoSelecionado) {
        setErro('Nenhum idoso selecionado.');
        setCarregando(false);
        return;
      }

      if (puxando) {
        setAtualizando(true);
      } else {
        setCarregando(true);
      }

      try {
        setLista(await config.buscar(idosoSelecionado));
      } catch (e) {
        setErro(config.textoErro);
      } finally {
        setCarregando(false);
        setAtualizando(false);
      }
    },
    [config, idosoSelecionado],
  );

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Adicionar, editar e excluir
  const crud = useCrudLista({
    tipo,
    config,
    idosoSelecionado,
    recarregar: () => carregar(true),
  });

  const agora = useMemo(() => Date.now(), [lista]);

  const dados = useMemo(
    () => (config.ordenar ? config.ordenar(lista, agora) : lista),
    [config, lista, agora],
  );

  const voltar = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const renderItem = ({ item }) => {
    const Item = config.Item;

    return (
      <Item
        item={item}
        styles={styles}
        cores={cores}
        agora={agora}
        onEditar={() => crud.abrirEditar(item)}
        onExcluir={() => crud.pedirExclusao(item)}
        onCompareceu={() => crud.pedirCompareceu(item)}
      />
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
            color={cores.texto}
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
          name={config.iconeVazio}
          size={56}
          color={cores.texto}
        />

        <Text style={styles.estadoTexto}>{config.textoVazio}</Text>
      </View>
    );
  };

  const cabecalho = (
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
          color={cores.texto}
        />
      </Pressable>

      <View style={styles.tituloContainer}>
        <Text style={styles.titulo}>{config.titulo}</Text>

        <Text style={styles.subtitulo} numberOfLines={1}>
          {idosoSelecionado?.nome ?? 'Idoso'}
        </Text>
      </View>
    </View>
  );

  const nomeExcluir = crud.itemExcluir
    ? config.nomeDoItem(crud.itemExcluir)
    : '';

  const nomeCompareceu = crud.itemCompareceu
    ? config.nomeDoItem(crud.itemCompareceu)
    : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={cores.fundo} barStyle={cores.statusBar} />

      {cabecalho}

      {idosoSelecionado ? (
        <Pressable
          style={({ pressed }) => [
            styles.botaoAdicionar,
            pressed && styles.botaoPressionado,
          ]}
          accessibilityRole="button"
          accessibilityLabel={config.textoAdicionar}
          onPress={crud.abrirNovo}
        >
          <MaterialCommunityIcons name="plus" size={26} color="#FFFFFF" />
          <Text style={styles.botaoAdicionarTexto}>{config.textoAdicionar}</Text>
        </Pressable>
      ) : null}

      {carregando ? (
        <View
          style={styles.lista}
          accessible
          accessibilityLabel={`Carregando ${config.titulo.toLowerCase()}`}
        >
          {[0, 1, 2].map((i) => (
            <SkeletonBloco key={i} style={styles.skCard} />
          ))}
        </View>
      ) : (
        <FlatList
          data={dados}
          keyExtractor={(item, index) => `${item.id ?? tipo}-${index}`}
          renderItem={renderItem}
          ListEmptyComponent={renderVazio}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={() => carregar(true)}
              colors={[cores.cards[0]]}
            />
          }
        />
      )}

      {/* Adicionar / editar */}
      <FormularioModal
        visivel={crud.formAberto}
        icone={crud.editando ? 'pencil-outline' : 'plus-circle-outline'}
        corIcone={CORES_ALERTA.azul}
        titulo={crud.editando ? config.tituloEditar : config.tituloNovo}
        campos={config.campos}
        valores={crud.valores}
        erros={crud.errosForm}
        salvando={crud.salvando}
        textoConfirmar={crud.editando ? 'Salvar alterações' : 'Adicionar'}
        aoMudar={crud.mudarCampo}
        aoConfirmar={crud.salvar}
        aoCancelar={crud.fecharForm}
      />

      {/* Confirmação de exclusão */}
      <AlertaModal
        visivel={!!crud.itemExcluir}
        icone="trash-can-outline"
        corIcone={CORES_ALERTA.vermelho}
        titulo={`Quer excluir ${config.este} ${config.nomeItem}?`}
        mensagem={`"${nomeExcluir}" será removid${config.genero} e não poderá ser recuperad${config.genero}.`}
        botoes={[
          {
            texto: 'Sim, excluir',
            estilo: 'perigo',
            onPress: crud.confirmarExclusao,
          },
          {
            texto: 'Cancelar',
            estilo: 'neutro',
            onPress: crud.cancelarExclusao,
          },
        ]}
        aoFechar={crud.cancelarExclusao}
      />

      {/* Confirmação de "Compareceu" (só consultas) */}
      <AlertaModal
        visivel={!!crud.itemCompareceu}
        icone="check-circle-outline"
        corIcone={CORES_ALERTA.azul}
        titulo="O idoso compareceu à consulta?"
        mensagem={`A consulta com "${nomeCompareceu}" será marcada como compareceu.`}
        botoes={[
          {
            texto: 'Sim, compareceu',
            estilo: 'neutro',
            onPress: crud.confirmarCompareceu,
          },
          {
            texto: 'Cancelar',
            estilo: 'neutro',
            onPress: crud.cancelarCompareceu,
          },
        ]}
        aoFechar={crud.cancelarCompareceu}
      />

      {/* Resultado (sucesso ou erro) */}
      <AlertaModal
        visivel={!!crud.aviso}
        icone={crud.aviso?.icone}
        corIcone={crud.aviso?.corIcone}
        titulo={crud.aviso?.titulo ?? ''}
        mensagem={crud.aviso?.mensagem ?? ''}
        botoes={crud.aviso?.botoes ?? []}
        aoFechar={crud.fecharAviso}
      />
    </SafeAreaView>
  );
}

const criarStyles = (cores) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: cores.fundo,
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
      backgroundColor: cores.botaoHeader,
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
      color: cores.texto,
    },

    subtitulo: {
      fontSize: 16,
      color: cores.textoSecundario,
      marginTop: 6,
    },

    botaoAdicionar: {
      minHeight: 58,
      flexDirection: 'row',
      gap: 10,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: CORES_ALERTA.azul,
      marginHorizontal: 16,
      marginBottom: 16,
    },

    botaoAdicionarTexto: {
      color: '#FFFFFF',
      fontSize: 19,
      fontWeight: 'bold',
    },

    botaoPressionado: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },

    lista: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingBottom: 24,
    },

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

    cardTitulo: {
      flex: 1,
      flexShrink: 1,
      color: '#000000',
      fontSize: 22,
      fontWeight: 'bold',
    },

    bloco: {
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginTop: 14,
      gap: 8,
    },

    acoesCard: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 14,
    },

    botaoAcao: {
      flex: 1,
      minHeight: 50,
      flexDirection: 'row',
      gap: 8,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },

    botaoAcaoTexto: {
      color: '#000000',
      fontSize: 17,
      fontWeight: 'bold',
    },

    botaoAcaoLargo: {
      flex: 0,
      alignSelf: 'stretch',
      marginTop: 14,
    },

    linha: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    linhaTexto: {
      flex: 1,
      flexShrink: 1,
      color: '#000000',
      fontSize: 17,
      lineHeight: 23,
    },

    linhaTextoForte: {
      fontWeight: 'bold',
    },

    skCard: {
      height: 150,
      borderRadius: 24,
      marginBottom: 14,
      backgroundColor: cores.skeleton,
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
      color: cores.textoSecundario,
      fontSize: 18,
      textAlign: 'center',
    },

    botaoTentar: {
      backgroundColor: cores.botaoHeader,
      borderRadius: 24,
      paddingHorizontal: 24,
      paddingVertical: 12,
      marginTop: 6,
    },

    botaoTentarTexto: {
      color: cores.texto,
      fontSize: 17,
      fontWeight: 'bold',
    },
  });