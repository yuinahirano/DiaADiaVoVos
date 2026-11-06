import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SkeletonBloco } from '../../../components/Skeleton';
import { useTema } from '../../../contexts/TemaContext';
import { useIdosoSelecionado } from '../../../contexts/IdosoSelecionadoContext';
import { listarPulseiras } from '../../../services/api/api';
import {
  buscarIdoso,
  buscarUsuario,
  listarDoencasDoIdosoVinculado,
} from '../../../services/api/apiCuidador';
import PulseiraCuidador, { pulseiraDoIdoso } from '../PulseiraCuidador';
import InformacoesPessoais from './InformacoesPessoais';

// ---------- Formatação ----------
const soDigitos = (texto) => String(texto ?? '').replace(/\D/g, '');

const vazio = (valor) =>
  valor === undefined || valor === null || String(valor).trim() === '';

const ou = (valor) => (vazio(valor) ? '—' : String(valor));

function formatarTelefone(valor) {
  const d = soDigitos(valor);

  if (d.length === 11) {
    return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  if (d.length === 10) {
    return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return ou(valor);
}

// A API de doenças pode usar nomes diferentes de campo: tenta os mais comuns
function nomeDaDoenca(d) {
  return d?.nome ?? d?.nome_doenca ?? d?.doenca ?? d?.descricao ?? 'Doença';
}

// Linha "rótulo: valor" dentro dos cartões
function Linha({ styles, rotulo, valor }) {
  return (
    <View
      style={styles.linha}
      accessible
      accessibilityLabel={`${rotulo}: ${valor}`}
    >
      <Text style={styles.linhaRotulo}>{rotulo}</Text>
      <Text style={styles.linhaValor}>{valor}</Text>
    </View>
  );
}

// Cartão de seção. Com "onPress" vira um botão (seta à direita).
function Secao({
  styles,
  cores,
  icone,
  titulo,
  onPress,
  rotuloAcessivel,
  children,
}) {
  const topo = (
    <View style={styles.secaoTopo}>
      <MaterialCommunityIcons name={icone} size={28} color={cores.texto} />

      <Text style={styles.secaoTitulo}>{titulo}</Text>

      {onPress ? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={30}
          color={cores.texto}
        />
      ) : null}
    </View>
  );

  if (!onPress) {
    return (
      <View style={styles.secao}>
        {topo}
        {children}
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.secao,
        pressed && styles.secaoPressionada,
      ]}
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel ?? titulo}
      onPress={onPress}
    >
      {topo}
      {children}
    </Pressable>
  );
}

export default function PerfilIdoso() {
  const navigation = useNavigation();
  const { cores } = useTema();
  const { idosoSelecionado } = useIdosoSelecionado();

  const styles = useMemo(() => criarStyles(cores), [cores]);

  const idIdoso = idosoSelecionado?.id;
  const idUsuario = idosoSelecionado?.id_usuario;
  const nomeSelecionado = idosoSelecionado?.nome ?? 'Idoso';

  const [carregando, setCarregando] = useState(true);
  const [dados, setDados] = useState({
    idoso: null,
    usuario: null,
    doencas: [],
    pulseira: null,
  });
  const [falhas, setFalhas] = useState({});
  // 'perfil' | 'saude' (histórico de leituras da pulseira)
  const [tela, setTela] = useState('perfil');

  const buscarTudo = useCallback(async () => {
    const semId = () => Promise.reject(new Error('Id não informado'));

    const [idoso, usuario, doencas, pulseiras] = await Promise.allSettled([
      idIdoso ? buscarIdoso(idIdoso) : semId(),
      idUsuario ? buscarUsuario(idUsuario) : semId(),
      idUsuario ? listarDoencasDoIdosoVinculado(idUsuario) : semId(),
      listarPulseiras(),
    ]);

    const valor = (r, padrao) =>
      r.status === 'fulfilled' ? r.value ?? padrao : padrao;

    const listaPulseiras = valor(pulseiras, null);
    const pulseira = listaPulseiras
      ? pulseiraDoIdoso(listaPulseiras, {
          id: idIdoso,
          id_usuario: idUsuario,
        }) ?? null
      : null;

    return {
      dados: {
        idoso: valor(idoso, null),
        usuario: valor(usuario, null),
        doencas: valor(doencas, []),
        pulseira,
      },
      falhas: {
        idoso: idoso.status === 'rejected',
        usuario: usuario.status === 'rejected',
        doencas: doencas.status === 'rejected',
      },
    };
  }, [idIdoso, idUsuario]);

  // Toda vez que a tela ganha foco, atualiza
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      (async () => {
        const resultado = await buscarTudo();

        if (ativo) {
          setDados(resultado.dados);
          setFalhas(resultado.falhas);
          setCarregando(false);
        }
      })();

      return () => {
        ativo = false;
      };
    }, [buscarTudo]),
  );

  // Na tela de saúde, o botão voltar do Android volta para o perfil
  useEffect(() => {
    if (tela === 'perfil') {
      return undefined;
    }

    const inscricao = BackHandler.addEventListener('hardwareBackPress', () => {
      setTela('perfil');
      return true;
    });

    return () => inscricao.remove();
  }, [tela]);

  const voltar = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // Histórico de leituras da pulseira (mesma tela do card Saúde)
  if (tela === 'saude' && dados.pulseira) {
    return (
      <PulseiraCuidador
        modo="leituras"
        pulseira={dados.pulseira}
        onVoltar={() => setTela('perfil')}
      />
    );
  }

  // ---------- Dados para exibir ----------
  const idoso = dados.idoso;
  const nomeIdoso = dados.usuario?.nome ?? nomeSelecionado;
  const doencas = dados.doencas;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={cores.fundo} barStyle={cores.statusBar} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={styles.titulo} numberOfLines={2}>
              {nomeIdoso}
            </Text>

            <Text style={styles.subtitulo}>Dados do idoso</Text>
          </View>
        </View>

        {carregando ? (
          <View accessible accessibilityLabel="Carregando dados do idoso">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonBloco key={i} style={styles.skeleton} />
            ))}
          </View>
        ) : (
          <>
            {/* Dados pessoais, saúde, doenças e, por último, os endereços */}
            <InformacoesPessoais
              usuario={dados.usuario}
              falhou={falhas.usuario}
            >
              {/* Saúde e contato: toque abre a tela de saúde (leituras) */}
              <Secao
                styles={styles}
                cores={cores}
                icone="heart-outline"
                titulo="Saúde e contato"
                onPress={dados.pulseira ? () => setTela('saude') : undefined}
                rotuloAcessivel="Saúde e contato. Toque para ver a saúde do idoso"
              >
                {falhas.idoso ? (
                  <Text style={styles.aviso}>Não carregou</Text>
                ) : (
                  <>
                    <Linha
                      styles={styles}
                      rotulo="Tipo sanguíneo"
                      valor={ou(idoso?.tipo_sanguineo)}
                    />
                    <Linha
                      styles={styles}
                      rotulo="Telefone"
                      valor={formatarTelefone(idoso?.telefone)}
                    />
                    <Linha
                      styles={styles}
                      rotulo="Pessoa com deficiência"
                      valor={
                        vazio(idoso?.pcd)
                          ? '—'
                          : String(idoso.pcd).toLowerCase() === 'sim'
                            ? 'Sim'
                            : 'Não'
                      }
                    />
                  </>
                )}

                <Text style={styles.dica}>
                  {dados.pulseira
                    ? 'Toque para ver a saúde do idoso'
                    : 'Nenhuma pulseira vinculada a este idoso.'}
                </Text>
              </Secao>

              {/* Doenças: toque abre a lista de doenças */}
              <Secao
                styles={styles}
                cores={cores}
                icone="clipboard-pulse-outline"
                titulo="Doenças"
                onPress={() => navigation.navigate('ListaIdoso', { tipo: 'doencas' })}
                rotuloAcessivel="Doenças. Toque para ver a lista de doenças"
              >
                {falhas.doencas ? (
                  <Text style={styles.aviso}>Não carregou</Text>
                ) : doencas.length === 0 ? (
                  <Text style={styles.aviso}>Nenhuma doença cadastrada.</Text>
                ) : (
                  doencas.map((d, i) => (
                    <View key={String(d?.id ?? i)} style={styles.itemDoenca}>
                      <MaterialCommunityIcons
                        name="circle-small"
                        size={28}
                        color={cores.texto}
                      />

                      <Text style={styles.itemDoencaTexto}>
                        {nomeDaDoenca(d)}
                      </Text>
                    </View>
                  ))
                )}

                <Text style={styles.dica}>Toque para ver a lista de doenças</Text>
              </Secao>
            </InformacoesPessoais>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const criarStyles = (cores) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: cores.fundo,
    },

    container: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 28,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
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

    skeleton: {
      height: 150,
      borderRadius: 24,
      marginBottom: 14,
      backgroundColor: cores.skeleton,
    },

    secao: {
      backgroundColor: cores.superficie,
      borderRadius: 24,
      padding: 18,
      marginBottom: 14,
    },

    secaoPressionada: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },

    secaoTopo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },

    secaoTitulo: {
      flex: 1,
      color: cores.texto,
      fontSize: 22,
      fontWeight: 'bold',
    },

    linha: {
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: cores.borda,
    },

    linhaRotulo: {
      color: cores.textoSecundario,
      fontSize: 15,
    },

    linhaValor: {
      color: cores.texto,
      fontSize: 19,
      fontWeight: 'bold',
      marginTop: 2,
    },

    aviso: {
      color: cores.textoSecundario,
      fontSize: 17,
      lineHeight: 24,
    },

    dica: {
      color: cores.textoSecundario,
      fontSize: 16,
      lineHeight: 22,
      marginTop: 10,
    },

    itemDoenca: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    itemDoencaTexto: {
      flex: 1,
      color: cores.texto,
      fontSize: 19,
      fontWeight: 'bold',
      paddingVertical: 4,
    },
  });