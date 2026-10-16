import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { SkeletonBloco } from '../../components/Skeleton';
import { useTema } from '../../contexts/TemaContext';
import { useIdosoSelecionado } from '../../contexts/IdosoSelecionadoContext';
import { carregarResumoDoIdoso } from '../../services/api/apiCuidador';
import { listarPulseiras, listarLeituras } from '../../services/api/api';
import { lerPulseira } from '../../services/storage/pulseira';
import PulseiraCuidador, {
  formatarData,
  maisRecente,
  pulseiraDoIdoso,
} from './PulseiraCuidador';

// "3 consultas", "1 consulta", "Nenhuma consulta" ou "Não carregou"
function textoQuantidade(qtd, falhou, singular, plural, nenhum) {
  if (falhou) {
    return 'Não carregou';
  }

  if (qtd === 0) {
    return nenhum;
  }

  return `${qtd} ${qtd > 1 ? plural : singular}`;
}

export default function DetalhesIdoso() {
  const navigation = useNavigation();
  const { cores } = useTema();
  const { idosoSelecionado } = useIdosoSelecionado();

  const styles = useMemo(() => criarStyles(cores), [cores]);

  const [quantidades, setQuantidades] = useState({
    consultas: 0,
    medicamentos: 0,
    doencas: 0,
  });
  const [falhas, setFalhas] = useState({});
  // Esqueleto só no primeiro carregamento (depois atualiza em silêncio)
  const [carregando, setCarregando] = useState(true);

  // Saúde: a pulseira do idoso e a última leitura dela (vem da API)
  const [saude, setSaude] = useState({
    carregando: true,
    pulseira: null,
    ultima: null,
    falhou: false,
  });
  // Vínculo da pulseira salvo neste celular (usado no card e no painel)
  const [config, setConfig] = useState(null);
  // 'detalhes' | 'historico' | 'painel'
  const [tela, setTela] = useState('detalhes');

  const idIdoso = idosoSelecionado?.id;
  const idUsuario = idosoSelecionado?.id_usuario;
  const nomeIdoso = idosoSelecionado?.nome ?? 'Idoso';

  // Atualiza as quantidades sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      (async () => {
        if (!idIdoso) {
          setCarregando(false);
          return;
        }

        const resumo = await carregarResumoDoIdoso({ idIdoso, idUsuario });

        if (ativo) {
          setQuantidades({
            consultas: resumo.dados.consultas.length,
            medicamentos: resumo.dados.medicamentos.length,
            doencas: resumo.dados.doencas.length,
          });
          setFalhas(resumo.falhas);
          setCarregando(false);
        }
      })();

      return () => {
        ativo = false;
      };
    }, [idIdoso, idUsuario]),
  );

  // Atualiza a Saúde ao ganhar foco e ao voltar do histórico ou do painel.
  // Fica separado das quantidades: se a pulseira falhar, o resto não é afetado.
  useFocusEffect(
    useCallback(() => {
      if (tela !== 'detalhes') {
        return undefined;
      }

      let ativo = true;

      (async () => {
        if (!idIdoso) {
          setSaude((s) => ({ ...s, carregando: false }));
          return;
        }

        const [lista, vinculo] = await Promise.all([
          listarPulseiras().catch(() => null),
          lerPulseira().catch(() => null),
        ]);

        const pulseira = lista
          ? pulseiraDoIdoso(lista, { id: idIdoso, id_usuario: idUsuario })
          : null;

        let ultima = null;
        let falhou = lista === null;

        if (pulseira) {
          try {
            ultima = maisRecente(await listarLeituras(pulseira.id)) ?? null;
          } catch (e) {
            falhou = true;
          }
        }

        if (ativo) {
          setConfig(vinculo);
          setSaude({ carregando: false, pulseira, ultima, falhou });
        }
      })();

      return () => {
        ativo = false;
      };
    }, [idIdoso, idUsuario, tela]),
  );

  // Recarrega o vínculo depois de conectar ou desconectar no painel
  const recarregarConfig = useCallback(async () => {
    try {
      setConfig(await lerPulseira());
    } catch (e) {
      setConfig(null);
    }
  }, []);

  // No histórico e no painel, o botão voltar do Android volta para os detalhes
  useEffect(() => {
    if (tela === 'detalhes') {
      return undefined;
    }

    const inscricao = BackHandler.addEventListener('hardwareBackPress', () => {
      setTela('detalhes');
      return true;
    });

    return () => inscricao.remove();
  }, [tela]);

  const voltar = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // Histórico de leituras da pulseira do idoso
  if (tela === 'historico' && saude.pulseira) {
    return (
      <PulseiraCuidador
        modo="leituras"
        pulseira={saude.pulseira}
        onVoltar={() => setTela('detalhes')}
      />
    );
  }

  // Painel da pulseira: conectar, atualizar, Wi-Fi e desconectar
  if (tela === 'painel') {
    return (
      <PulseiraCuidador
        modo="painel"
        config={config}
        onMudou={recarregarConfig}
        onVoltar={() => setTela('detalhes')}
      />
    );
  }

  const ultima = saude.ultima;
  const dataUltima = ultima
    ? formatarData(ultima.medidoEm ?? ultima.medido_em)
    : null;

  const pulseiraNesteCelular =
    !!saude.pulseira &&
    !!config &&
    String(config.idPulseira) === String(saude.pulseira.id);

  let textoSaude = 'Ainda não há leituras da pulseira.';
  let rotuloSaude = 'Saúde, sem leituras. Toque para ver o histórico';

  if (saude.falhou && !ultima) {
    textoSaude = 'Não carregou';
    rotuloSaude = 'Saúde, não carregou';
  } else if (!saude.pulseira) {
    textoSaude = 'Nenhuma pulseira vinculada a este idoso.';
    rotuloSaude = 'Saúde, nenhuma pulseira vinculada a este idoso';
  } else if (ultima) {
    rotuloSaude =
      `Saúde, última leitura salva: ${ultima.bpm ?? '--'} batimentos por ` +
      `minuto e oxigênio ${ultima.spo2 ?? '--'} por cento. ` +
      'Toque para ver o histórico';
  }

  let nomePulseira = 'Nenhuma pulseira';
  let textoPulseira = 'Toque para conectar';

  if (saude.pulseira) {
    nomePulseira = saude.pulseira.nome;
    textoPulseira = pulseiraNesteCelular
      ? 'Sincronizando neste celular'
      : 'Toque para ver as opções';
  } else if (saude.falhou) {
    nomePulseira = 'Não carregou';
  }

  // "rota": quando existe, o card abre essa tela em vez da ListaIdoso
  const cards = [
    {
      tipo: 'consultas',
      titulo: 'Consultas',
      icone: 'calendar-check-outline',
      cor: cores.cards[0],
      texto: textoQuantidade(
        quantidades.consultas,
        falhas.consultas,
        'consulta',
        'consultas',
        'Nenhuma consulta',
      ),
    },
    {
      tipo: 'medicamentos',
      titulo: 'Medicamentos',
      icone: 'pill',
      cor: cores.cards[2],
      texto: textoQuantidade(
        quantidades.medicamentos,
        falhas.medicamentos,
        'medicamento',
        'medicamentos',
        'Nenhum medicamento',
      ),
    },
    {
      tipo: 'doencas',
      titulo: 'Doenças',
      icone: 'clipboard-pulse-outline',
      cor: cores.cards[3],
      largo: true,
      texto: textoQuantidade(
        quantidades.doencas,
        falhas.doencas,
        'doença',
        'doenças',
        'Nenhuma doença',
      ),
    },
    {
      tipo: 'perfil',
      titulo: 'Dados do idoso',
      icone: 'account-details-outline',
      cor: COR_PERFIL,
      largo: true,
      rota: 'PerfilIdoso',
      texto: 'Dados pessoais',
    },
  ];

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

            <Text style={styles.subtitulo}>O que você quer acompanhar?</Text>
          </View>
        </View>

        <View style={styles.menu}>
          {/* Saúde: última leitura direto no card; ao tocar abre o histórico */}
          {saude.carregando ? (
            <SkeletonBloco
              style={[styles.cardSaude, styles.skeleton, styles.skeletonSaude]}
            />
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.cardSaude,
                { backgroundColor: COR_SAUDE },
                pressed && styles.cardPressionado,
              ]}
              disabled={!saude.pulseira}
              onPress={() => setTela('historico')}
              accessibilityRole="button"
              accessibilityLabel={rotuloSaude}
            >
              <View style={styles.saudeTopo}>
                <View style={styles.saudeIcone}>
                  <MaterialCommunityIcons
                    name="heart-pulse"
                    size={34}
                    color="#000000"
                  />
                </View>

                <Text style={styles.saudeTitulo}>Saúde</Text>

                {saude.pulseira ? (
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={30}
                    color="#000000"
                  />
                ) : null}
              </View>

              {ultima ? (
                <>
                  <View style={styles.selo}>
                    <MaterialCommunityIcons
                      name="history"
                      size={20}
                      color="#000000"
                    />

                    <Text style={styles.seloTexto}>ÚLTIMA LEITURA SALVA</Text>
                  </View>

                  <View style={styles.saudeValores}>
                    <View style={styles.saudeValor}>
                      <Text style={styles.saudeRotulo}>Batimentos</Text>

                      <Text style={styles.saudeNumero}>
                        {ultima.bpm ?? '--'} bpm
                      </Text>
                    </View>

                    <View style={styles.saudeValor}>
                      <Text style={styles.saudeRotulo}>Oxigênio</Text>

                      <Text style={styles.saudeNumero}>
                        {ultima.spo2 ?? '--'}%
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.saudeData}>Medido em: {dataUltima}</Text>

                  <Text style={styles.saudeDica}>
                    Toque para ver o histórico
                  </Text>
                </>
              ) : (
                <Text style={styles.saudeTexto}>{textoSaude}</Text>
              )}
            </Pressable>
          )}

          {/* Pulseira: abre o painel (conectar, atualizar, Wi-Fi, desconectar) */}
          {saude.carregando ? (
            <SkeletonBloco
              style={[styles.card, styles.cardLargo, styles.skeleton]}
            />
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                styles.cardLargo,
                styles.cardPulseira,
                { backgroundColor: COR_PULSEIRA },
                pressed && styles.cardPressionado,
              ]}
              onPress={() => setTela('painel')}
              accessibilityRole="button"
              accessibilityLabel={`Pulseira, ${nomePulseira}, ${textoPulseira}`}
            >
              <MaterialCommunityIcons name="watch" size={48} color="#000000" />

              <View style={styles.textosPulseira}>
                <Text style={styles.cardTitulo}>Pulseira</Text>

                <Text style={styles.textoPulseira}>{nomePulseira}</Text>

                <Text style={styles.textoPulseira}>{textoPulseira}</Text>
              </View>
            </Pressable>
          )}

          {carregando ? (
            <>
              <SkeletonBloco style={[styles.card, styles.skeleton]} />
              <SkeletonBloco style={[styles.card, styles.skeleton]} />
              <SkeletonBloco
                style={[styles.card, styles.cardLargo, styles.skeleton]}
              />
              <SkeletonBloco
                style={[styles.card, styles.cardLargo, styles.skeleton]}
              />
            </>
          ) : (
            cards.map((card) => (
              <Pressable
                key={card.tipo}
                style={({ pressed }) => [
                  styles.card,
                  card.largo && styles.cardLargo,
                  { backgroundColor: card.cor },
                  pressed && styles.cardPressionado,
                ]}
                onPress={() =>
                  card.rota
                    ? navigation.navigate(card.rota)
                    : navigation.navigate('ListaIdoso', { tipo: card.tipo })
                }
                accessibilityRole="button"
                accessibilityLabel={`${card.titulo}, ${card.texto}`}
              >
                <MaterialCommunityIcons
                  name={card.icone}
                  size={card.largo ? 48 : 60}
                  color="#000000"
                />

                <View style={card.largo ? styles.textosLargo : styles.textos}>
                  <Text style={styles.cardTitulo}>{card.titulo}</Text>
                  <Text style={styles.cardQuantidade}>{card.texto}</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Cores dos cards de Saúde (rosa) e de Pulseira (laranja claro)
const COR_SAUDE = '#F5B4C5';
const COR_PULSEIRA = '#FFB784';
// Cor do card "Dados do idoso" (azul-turquesa claro)
const COR_PERFIL = '#8FD9E8';

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
      paddingBottom: 24,
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

    menu: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },

    card: {
      width: '48.5%',
      aspectRatio: 0.88,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
      marginBottom: 14,
    },

    cardLargo: {
      width: '100%',
      height: 112,
      aspectRatio: undefined,
      flexDirection: 'row',
      gap: 20,
      borderRadius: 24,
    },

    cardPressionado: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },

    textos: {
      alignItems: 'center',
      marginTop: 14,
    },

    textosLargo: {
      alignItems: 'flex-start',
    },

    cardTitulo: {
      color: '#000000',
      fontSize: 19,
      fontWeight: 'bold',
      textAlign: 'center',
    },

    cardQuantidade: {
      color: '#000000',
      fontSize: 16,
      marginTop: 4,
      textAlign: 'center',
    },

    skeleton: {
      backgroundColor: cores.skeleton,
    },

    // Card de Saúde: altura acompanha o conteúdo
    cardSaude: {
      width: '100%',
      borderRadius: 24,
      padding: 18,
      gap: 14,
      marginBottom: 14,
    },

    skeletonSaude: {
      height: 220,
    },

    saudeTopo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },

    saudeIcone: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    saudeTitulo: {
      flex: 1,
      flexShrink: 1,
      color: '#000000',
      fontSize: 22,
      fontWeight: 'bold',
    },

    // Etiqueta da última leitura salva
    selo: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#FFFFFF',
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },

    seloTexto: {
      color: '#000000',
      fontSize: 14,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },

    // Cada valor ocupa metade da linha; se não couber, quebra para baixo
    saudeValores: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },

    saudeValor: {
      flexGrow: 1,
      flexBasis: '45%',
      flexShrink: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },

    saudeRotulo: {
      color: '#000000',
      fontSize: 14,
      fontWeight: 'bold',
    },

    saudeNumero: {
      color: '#000000',
      fontSize: 34,
      fontWeight: 'bold',
      marginTop: 2,
    },

    saudeData: {
      color: '#000000',
      fontSize: 17,
      lineHeight: 23,
      fontWeight: 'bold',
    },

    saudeDica: {
      color: '#000000',
      fontSize: 16,
      lineHeight: 22,
    },

    saudeTexto: {
      color: '#000000',
      fontSize: 18,
      lineHeight: 25,
    },

    // Card de Pulseira: mesma largura do card de Doenças, altura acompanha o conteúdo
    cardPulseira: {
      height: undefined,
      minHeight: 112,
      paddingVertical: 16,
      paddingHorizontal: 18,
    },

    textosPulseira: {
      flexShrink: 1,
      alignItems: 'flex-start',
    },

    textoPulseira: {
      color: '#000000',
      fontSize: 16,
      marginTop: 2,
    },
  });