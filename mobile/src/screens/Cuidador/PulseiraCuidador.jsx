import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  testarPulseira,
  procurarPulseiras,
  acharPorNome,
  esquecerWifiPulseira,
  pulseiraOnline,
} from '../../services/http/pulseiraHttp';
import {
  listarPulseiras,
  listarLeituras,
  vincularPulseira,
} from '../../services/api/api';
import {
  esquecerPulseira,
  salvarPulseira,
} from '../../services/storage/pulseira';
import { sincronizarAgora } from '../../services/sync/sync';
import AlertaModal, { CORES_ALERTA } from '../../components/AlertaModal';
import {
  SkeletonTela,
  SkeletonCabecalho,
  SkeletonBloco,
} from '../../components/Skeleton';

// Botão grande
function Botao({ titulo, onPress, disabled, variante = 'primario', icone }) {
  const v = VARIANTES[variante] ?? VARIANTES.primario;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.botao,
        { backgroundColor: v.fundo },
        v.borda && styles.botaoBorda,
        (disabled || pressed) && styles.botaoApagado,
      ]}
    >
      {icone ? (
        <MaterialCommunityIcons name={icone} size={26} color={v.texto} />
      ) : null}

      <Text style={[styles.botaoTexto, { color: v.texto }]}>
        {titulo}
      </Text>
    </Pressable>
  );
}

// Cabeçalho das telas internas: seta de voltar, título e subtítulo
function Cabecalho({ titulo, subtitulo, onVoltar, desabilitado }) {
  return (
    <View style={styles.header}>
      <Pressable
        style={[styles.botaoHeader, desabilitado && styles.botaoApagado]}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={onVoltar}
        disabled={desabilitado}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={28}
          color={cores.preto}
        />
      </Pressable>

      <View style={styles.tituloContainer}>
        <Text style={styles.titulo} numberOfLines={2}>
          {titulo}
        </Text>

        {subtitulo ? (
          <Text style={styles.subtitulo} numberOfLines={2}>
            {subtitulo}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// ISO 8601 (com "Z" = UTC) ou epoch -> dd/mm/aaaa hh:mm:ss no fuso do celular
export function formatarData(valor) {
  if (valor === undefined || valor === null) return '--';

  const d =
    typeof valor === 'number'
      ? new Date(valor < 1e12 ? valor * 1000 : valor)
      : new Date(valor);

  if (Number.isNaN(d.getTime())) return String(valor);

  const dois = (n) => String(n).padStart(2, '0');

  return (
    `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()} ` +
    `${dois(d.getHours())}:${dois(d.getMinutes())}:${dois(d.getSeconds())}`
  );
}

// A leitura mais recente de uma lista
export function maisRecente(lista) {
  return [...lista].sort((a, b) => {
    const ta = new Date(a.medidoEm ?? a.medido_em).getTime() || 0;
    const tb = new Date(b.medidoEm ?? b.medido_em).getTime() || 0;
    return tb - ta;
  })[0];
}

// Descobre qual pulseira da lista é do idoso.
// Confere o id do idoso e o id do usuário dele, nos nomes de campo que a API
// costuma enviar. Se nenhum bater, devolve null.
export function pulseiraDoIdoso(lista, idoso) {
  const mesmo = (a, b) =>
    a !== undefined && a !== null && b !== undefined && b !== null
      ? String(a) === String(b)
      : false;

  return (
    (lista ?? []).find((p) => {
      const idDoIdoso = p.id_idoso ?? p.idIdoso ?? p.idoso_id ?? p.idoso?.id;
      const idDoUsuario =
        p.id_usuario ?? p.idUsuario ?? p.usuario_id ?? p.usuario?.id;

      return (
        mesmo(idDoIdoso, idoso?.id) ||
        mesmo(idDoUsuario, idoso?.id_usuario)
      );
    }) ?? null
  );
}

// Erro com mensagem pronta para mostrar ao cuidador
function amigavel(texto) {
  const e = new Error(texto);
  e.amigavel = true;
  return e;
}

// Aparência do card de status: procurando, conectada ou desligada
export function infoStatus(buscando, online) {
  if (buscando) {
    return {
      texto: 'Procurando a pulseira na rede...',
      icone: 'radar',
      fundo: cores.suave,
    };
  }

  if (online) {
    return {
      texto: '✓ Pulseira conectada',
      icone: 'heart-pulse',
      fundo: cores.rosa,
    };
  }

  return {
    texto: 'Pulseira desligada ou fora do Wi-Fi',
    icone: 'wifi-off',
    fundo: cores.destaque,
  };
}

// Pergunta à pulseira, de tempos em tempos, se ela está respondendo.
// online: null = procurando, true = respondeu, false = não respondeu
export function usePulseiraOnline(ip, ativo = true) {
  const [online, setOnline] = useState(null);

  const verificar = useCallback(async () => {
    if (!ip) {
      setOnline(false);
      return false;
    }

    const ok = await pulseiraOnline(ip);
    setOnline(ok);
    return ok;
  }, [ip]);

  useEffect(() => {
    if (!ativo || !ip) return undefined;

    let vivo = true;
    setOnline(null); // "procurando" só na primeira checagem, sem piscar nas seguintes

    const checar = async () => {
      const ok = await pulseiraOnline(ip);
      if (vivo) setOnline(ok);
    };

    checar();
    const id = setInterval(checar, 10000);

    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, [ip, ativo]);

  return { online, verificar };
}

// Animações do card: "pulso" enquanto procura e "pop" ao tocar em Atualizar.
// estiloAnimado é aplicado em um Animated.View.
export function useAnimacaoCard(buscando) {
  const pulso = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!buscando) {
      pulso.stopAnimation();
      pulso.setValue(0);
      return undefined;
    }

    const laco = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulso, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    laco.start();

    return () => laco.stop();
  }, [buscando, pulso]);

  // Aperta e solta o card com efeito de mola
  const animarPop = useCallback(() => {
    Animated.sequence([
      Animated.timing(pop, {
        toValue: 0.95,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(pop, {
        toValue: 1,
        friction: 3,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pop]);

  const estiloAnimado = useMemo(
    () => ({
      opacity: pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }),
      transform: [
        {
          scale: Animated.multiply(
            pop,
            pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }),
          ),
        },
      ],
    }),
    [pulso, pop],
  );

  return { estiloAnimado, animarPop };
}

// ---------------------------------------------------------------------------
// LEITURAS: lista as pulseiras e, ao tocar, mostra as leituras dela.
// Se receber uma pulseira pronta (DetalhesIdoso), abre direto as leituras dela.
// ---------------------------------------------------------------------------
function Leituras({ pulseira: fixa, onVoltar }) {
  const [pulseiras, setPulseiras] = useState([]);
  const [selecionada, setSelecionada] = useState(fixa ?? null); // { id, nome }
  const [leituras, setLeituras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarLista = useCallback(async () => {
    setCarregando(true);
    setErro('');

    try {
      setPulseiras(await listarPulseiras());
    } catch (e) {
      setErro(
        'Não consegui buscar as pulseiras. Confira a internet e tente de novo.',
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  const carregarLeituras = useCallback(async (pulseira) => {
    setCarregando(true);
    setErro('');

    try {
      const lista = await listarLeituras(pulseira.id);
      const ordenadas = [...lista].sort((a, b) => {
        const ta = new Date(a.medidoEm ?? a.medido_em).getTime() || 0;
        const tb = new Date(b.medidoEm ?? b.medido_em).getTime() || 0;
        return tb - ta;
      });

      setLeituras(ordenadas);
    } catch (e) {
      setErro(
        'Não consegui buscar as leituras. Confira a internet e tente de novo.',
      );
      setLeituras([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (fixa) {
      carregarLeituras(fixa);
    } else {
      carregarLista();
    }
  }, [fixa?.id, carregarLista, carregarLeituras]);

  const abrir = (pulseira) => {
    setSelecionada(pulseira);
    setLeituras([]);
    carregarLeituras(pulseira);
  };

  const voltarParaLista = () => {
    setSelecionada(null);
    setLeituras([]);
    setErro('');
  };

  // Primeira carga: mostra o esqueleto dos cards
  const primeiraCarga =
    carregando &&
    (selecionada ? leituras.length === 0 : pulseiras.length === 0);

  if (primeiraCarga) {
    return (
      <SkeletonTela
        rotulo={selecionada ? 'Carregando leituras' : 'Carregando pulseiras'}
      >
        <SkeletonCabecalho />

        <View style={styles.lista}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.cardTopo}>
                <SkeletonBloco style={styles.skeletonIcone} />
                <SkeletonBloco style={styles.skeletonData} />
              </View>

              {selecionada ? (
                <View style={styles.linhaValores}>
                  <SkeletonBloco style={styles.skeletonValor} />
                  <SkeletonBloco style={styles.skeletonValor} />
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </SkeletonTela>
    );
  }

  // Leituras da pulseira escolhida
  if (selecionada) {
    return (
      <SafeAreaView style={styles.telaFixa}>
        <StatusBar backgroundColor={cores.fundo} barStyle="dark-content" />

        <Cabecalho
          titulo={selecionada.nome}
          subtitulo={`${leituras.length} ${
            leituras.length === 1 ? 'leitura' : 'leituras'
          }`}
          onVoltar={fixa ? onVoltar : voltarParaLista}
        />

        {erro ? <Text style={styles.erroTexto}>{erro}</Text> : null}

        {carregando ? (
          <ActivityIndicator
            size="large"
            color={cores.preto}
            style={styles.carregandoLista}
          />
        ) : null}

        <FlatList
          data={leituras}
          keyExtractor={(item, i) =>
            String(
              item.id ?? item.seq ?? `${item.medidoEm ?? item.medido_em}-${i}`,
            )
          }
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !carregando && !erro ? (
              <Text style={styles.vazio}>
                Ainda não há leituras da pulseira
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            // Altura do card acompanha o conteúdo
            <View style={styles.cardLeitura}>
              <View style={styles.cardTopo}>
                <View style={styles.cardIcone}>
                  <MaterialCommunityIcons
                    name="heart-pulse"
                    size={30}
                    color={cores.preto}
                  />
                </View>

                <Text style={styles.data}>
                  {formatarData(item.medidoEm ?? item.medido_em)}
                </Text>
              </View>

              <View style={styles.linhaValores}>
                <View style={styles.valorBloco}>
                  <Text style={styles.valorRotulo}>Batimentos</Text>

                  <Text style={styles.valor}>{item.bpm ?? '--'} bpm</Text>
                </View>

                <View style={styles.valorBloco}>
                  <Text style={styles.valorRotulo}>Oxigênio</Text>

                  <Text style={styles.valor}>SpO2 {item.spo2 ?? '--'}%</Text>
                </View>
              </View>
            </View>
          )}
        />

        <View style={styles.rodape}>
          <Botao
            titulo="Atualizar"
            icone="refresh"
            variante="destaque"
            onPress={() => carregarLeituras(selecionada)}
            disabled={carregando}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Lista de pulseiras
  return (
    <SafeAreaView style={styles.telaFixa}>
      <StatusBar backgroundColor={cores.fundo} barStyle="dark-content" />

      <Cabecalho
        titulo="Pulseiras"
        subtitulo="Toque em uma pulseira para ver as leituras dela"
        onVoltar={onVoltar}
      />

      {erro ? <Text style={styles.erroTexto}>{erro}</Text> : null}

      {carregando ? (
        <ActivityIndicator
          size="large"
          color={cores.preto}
          style={styles.carregandoLista}
        />
      ) : null}

      <ScrollView
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      >
        {pulseiras.map((p) => (
          <Pressable
            key={p.id}
            style={({ pressed }) => [
              styles.cardPulseira,
              pressed && styles.cardPressionado,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${p.nome}, ver leituras`}
            onPress={() => abrir(p)}
          >
            <View style={styles.cardTopo}>
              <View style={styles.cardIcone}>
                <MaterialCommunityIcons
                  name="watch"
                  size={30}
                  color={cores.preto}
                />
              </View>

              <View style={styles.cardTextos}>
                <Text style={styles.cardTitulo}>{p.nome}</Text>

                <Text style={styles.data}>Ver leituras</Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={30}
                color={cores.preto}
              />
            </View>
          </Pressable>
        ))}

        {!carregando && !erro && pulseiras.length === 0 ? (
          <Text style={styles.vazio}>Nenhuma pulseira encontrada</Text>
        ) : null}
      </ScrollView>

      <View style={styles.rodape}>
        <Botao
          titulo="Atualizar lista"
          icone="refresh"
          variante="destaque"
          onPress={carregarLista}
          disabled={carregando}
        />
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// MINHA PULSEIRA: conectar, atualizar, trocar o Wi-Fi e desconectar
// ---------------------------------------------------------------------------
function MinhaPulseira({ config, onMudou, onVoltar }) {
  const [passo, setPasso] = useState('inicio'); // inicio | procurando | escolherPulseira | escolherCadastro | erro
  const [nomeBusca, setNomeBusca] = useState('');
  const [achadas, setAchadas] = useState([]); // pulseiras encontradas na rede
  const [cadastradas, setCadastradas] = useState([]); // pulseiras da conta
  const [alvo, setAlvo] = useState(null); // pulseira da rede escolhida
  const [mensagem, setMensagem] = useState(''); // erro do passo de conexão
  const [aviso, setAviso] = useState(''); // recado depois de uma ação
  const [ocupado, setOcupado] = useState(false);
  const [confirmacao, setConfirmacao] = useState(null); // pergunta antes de desfazer a conexão

  // Verifica se a pulseira responde (só com pulseira conectada)
  const { online, verificar } = usePulseiraOnline(config?.ip, !!config);

  // Procurando: checagem automática, botão "Atualizar agora" ou busca na rede
  const buscando = config
    ? online === null || ocupado
    : passo === 'procurando';

  const { estiloAnimado, animarPop } = useAnimacaoCard(buscando);

  const falhou = (e) => {
    setMensagem(
      e.amigavel ? e.message : 'Não consegui conectar. Tente de novo.',
    );
    setPasso('erro');
  };

  // Guarda o vínculo no celular; a tela muda para "pulseira conectada"
  const vincular = async (cadastrada, ip) => {
    const deviceToken = await vincularPulseira(cadastrada.id);

    await salvarPulseira({ idPulseira: cadastrada.id, deviceToken, ip });
    await onMudou();

    setAviso('Pronto! Pulseira conectada.');
    setPasso('inicio');
  };

  // Testa a pulseira encontrada e liga ela à conta
  const conectarEm = async (p) => {
    setPasso('procurando');

    try {
      await testarPulseira(p.ip);

      const lista = await listarPulseiras();

      if (lista.length === 0) {
        throw amigavel('Ainda não há nenhuma pulseira cadastrada na conta.');
      }

      if (lista.length > 1) {
        setAlvo(p);
        setCadastradas(lista);
        setPasso('escolherCadastro');
        return;
      }

      await vincular(lista[0], p.ip);
    } catch (e) {
      falhou(e);
    }
  };

  // Procura a pulseira na rede (sem nome = qualquer uma)
  const procurar = async (nome) => {
    setPasso('procurando');
    setMensagem('');
    setAviso('');

    try {
      let encontradas;

      if (nome) {
        const achada = await acharPorNome(nome);
        encontradas = achada ? [achada] : [];
      } else {
        encontradas = await procurarPulseiras();
      }

      if (encontradas.length === 0) {
        throw amigavel(
          nome
            ? `Não encontrei a pulseira "${nome}". Confira o nome que aparece nela e o Wi-Fi.`
            : 'Não encontrei a pulseira. Veja se ela está ligada e se o celular está no mesmo Wi-Fi que ela.',
        );
      }

      if (encontradas.length > 1) {
        setAchadas(encontradas);
        setPasso('escolherPulseira');
        return;
      }

      await conectarEm(encontradas[0]);
    } catch (e) {
      falhou(e);
    }
  };

  const procurarPeloNome = () => {
    const nome = nomeBusca.trim();

    if (!nome) {
      setMensagem('Digite o nome que aparece na tela da pulseira.');
      setPasso('erro');
      return;
    }

    procurar(nome);
  };

  const escolherCadastro = async (cadastrada) => {
    setPasso('procurando');

    try {
      await vincular(cadastrada, alvo.ip);
    } catch (e) {
      falhou(e);
    }
  };

  // Envia as leituras da pulseira para o aplicativo agora
  const atualizar = async () => {
    animarPop();
    setOcupado(true);
    setAviso('Atualizando...');

    try {
      await sincronizarAgora(() => {});
      setAviso('Tudo atualizado!');
    } catch (e) {
      setAviso('');
    } finally {
      await verificar();
      setOcupado(false);
      animarPop();
    }
  };

  const fazerTrocaDeWifi = async () => {
    setOcupado(true);

    try {
      await esquecerWifiPulseira(config.ip);
      await esquecerPulseira();
      await onMudou();

      setAviso(
        'A pulseira esqueceu o Wi-Fi. Conecte o celular na rede que ela abriu e escolha o novo Wi-Fi.',
      );
    } catch (e) {
      setAviso(
        'Não consegui falar com a pulseira. Veja se ela está ligada e no mesmo Wi-Fi.',
      );
    } finally {
      setOcupado(false);
    }
  };

  const fazerDesconexao = async () => {
    setOcupado(true);

    try {
      await esquecerPulseira();
      await onMudou();

      setAviso('Pulseira desconectada.');
    } catch (e) {
      setAviso('Não consegui desconectar. Tente de novo.');
    } finally {
      setOcupado(false);
    }
  };

  // Executa a ação depois da confirmação (ações que desfazem a conexão)
  const confirmarAcao = () => {
    const acao = confirmacao?.acao;

    setConfirmacao(null);
    acao?.();
  };

  const modal = (
    <AlertaModal
      visivel={!!confirmacao}
      icone={confirmacao?.icone}
      corIcone={confirmacao?.corIcone}
      titulo={confirmacao?.titulo ?? ''}
      mensagem={confirmacao?.mensagem ?? ''}
      botoes={[
        {
          texto: 'Continuar',
          estilo: confirmacao?.perigo ? 'perigo' : 'neutro',
          onPress: confirmarAcao,
        },
        {
          texto: 'Cancelar',
          estilo: 'neutro',
          onPress: () => setConfirmacao(null),
        },
      ]}
      aoFechar={() => setConfirmacao(null)}
    />
  );

  // ----- Pulseira já conectada -----
  if (config) {
    const st = infoStatus(buscando, online);

    let detalhe = 'Ligue a pulseira e confira se está no mesmo Wi-Fi.';

    if (buscando) {
      detalhe = 'Isso leva alguns segundos.';
    } else if (online) {
      detalhe = 'As leituras são enviadas sozinhas para o aplicativo.';
    }

    return (
      <SafeAreaView style={styles.telaFixa}>
        <StatusBar backgroundColor={cores.fundo} barStyle="dark-content" />

        <Cabecalho
          titulo="Minha pulseira"
          subtitulo="Conexão e sincronização"
          onVoltar={onVoltar}
        />

        <ScrollView
          contentContainerStyle={styles.corpo}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[styles.card, { backgroundColor: st.fundo }, estiloAnimado]}
          >
            <View style={styles.cardTopo}>
              <View style={styles.cardIcone}>
                <MaterialCommunityIcons
                  name={st.icone}
                  size={34}
                  color={cores.preto}
                />
              </View>

              <Text style={styles.status}>{st.texto}</Text>
            </View>

            <Text style={styles.texto}>{detalhe}</Text>
          </Animated.View>

          {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}

          <Botao
            titulo="Atualizar agora"
            icone="refresh"
            variante="destaque"
            onPress={atualizar}
            disabled={ocupado}
          />

          <Botao
            titulo="Trocar o Wi-Fi da pulseira"
            icone="swap-horizontal"
            variante="suave"
            disabled={ocupado}
            onPress={() =>
              setConfirmacao({
                icone: 'swap-horizontal',
                corIcone: CORES_ALERTA.azul,
                titulo: 'Trocar o Wi-Fi da pulseira',
                mensagem:
                  'A pulseira vai esquecer a rede atual e abrir uma rede própria para você escolher outra. Deseja continuar?',
                acao: fazerTrocaDeWifi,
              })
            }
          />

          <Botao
            titulo="Desconectar pulseira"
            icone="link-off"
            variante="perigo"
            disabled={ocupado}
            onPress={() =>
              setConfirmacao({
                icone: 'link-off',
                corIcone: CORES_ALERTA.vermelho,
                titulo: 'Desconectar pulseira',
                mensagem:
                  'Este celular vai deixar de receber as leituras da pulseira. Deseja continuar?',
                perigo: true,
                acao: fazerDesconexao,
              })
            }
          />
        </ScrollView>

        {modal}
      </SafeAreaView>
    );
  }

  // ----- Pulseira ainda não conectada -----
  // A seta volta um passo nas escolhas; nas outras telas sai do painel
  const voltarUmPasso = ['escolherPulseira', 'escolherCadastro'].includes(passo);

  return (
    <SafeAreaView style={styles.telaFixa}>
      <StatusBar backgroundColor={cores.fundo} barStyle="dark-content" />

      <Cabecalho
        titulo="Conectar pulseira"
        subtitulo="Ligue a pulseira ao aplicativo"
        onVoltar={voltarUmPasso ? () => setPasso('inicio') : onVoltar}
        desabilitado={passo === 'procurando'}
      />

      <ScrollView
        contentContainerStyle={styles.corpo}
        showsVerticalScrollIndicator={false}
      >
        {passo === 'inicio' && (
          <>
            {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}

            <View style={[styles.card, { backgroundColor: cores.destaque }]}>
              {[
                'Ligue a pulseira.',
                'Deixe o celular no mesmo Wi-Fi que ela.',
                'Toque no botão abaixo.',
              ].map((texto, i) => (
                <View key={texto} style={styles.passoLinha}>
                  <View style={styles.passoNumero}>
                    <Text style={styles.passoNumeroTexto}>{i + 1}</Text>
                  </View>

                  <Text style={styles.passoTexto}>{texto}</Text>
                </View>
              ))}
            </View>

            <Botao
              titulo="Procurar pulseira"
              icone="magnify"
              variante="destaque"
              onPress={() => procurar()}
            />

            <Text style={styles.secao}>Não encontrou?</Text>

            <TextInput
              style={styles.input}
              value={nomeBusca}
              onChangeText={setNomeBusca}
              placeholder="Nome que aparece na pulseira"
              placeholderTextColor={cores.textoSecundario}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Botao
              titulo="Procurar pelo nome"
              icone="magnify"
              variante="suave"
              onPress={procurarPeloNome}
            />
          </>
        )}

        {passo === 'procurando' && (
          <Animated.View
            style={[
              styles.card,
              styles.cardCentro,
              { backgroundColor: cores.rosa },
              estiloAnimado,
            ]}
          >
            <MaterialCommunityIcons
              name="radar"
              size={56}
              color={cores.preto}
            />

            <Text style={[styles.texto, styles.textoCentro]}>
              Procurando a pulseira na rede... isso leva alguns segundos.
            </Text>
          </Animated.View>
        )}

        {passo === 'escolherPulseira' && (
          <>
            <Text style={styles.texto}>
              Encontrei mais de uma pulseira. Qual você quer conectar?
            </Text>

            {achadas.map((p) => (
              <Botao
                key={p.ip}
                titulo={p.nome}
                icone="watch"
                variante="suave"
                onPress={() => conectarEm(p)}
              />
            ))}
          </>
        )}

        {passo === 'escolherCadastro' && (
          <>
            <Text style={styles.texto}>Qual é esta pulseira?</Text>

            {cadastradas.map((p) => (
              <Botao
                key={p.id}
                titulo={p.nome}
                icone="watch"
                variante="suave"
                onPress={() => escolherCadastro(p)}
              />
            ))}
          </>
        )}

        {passo === 'erro' && (
          <>
            <View style={[styles.card, { backgroundColor: cores.branco }]}>
              <View style={styles.cardTopo}>
                <View
                  style={[styles.cardIcone, { backgroundColor: cores.suave }]}
                >
                  <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={34}
                    color={cores.erro}
                  />
                </View>

                <Text style={styles.erro}>{mensagem}</Text>
              </View>
            </View>

            <Botao
              titulo="Tentar de novo"
              icone="refresh"
              variante="destaque"
              onPress={() => setPasso('inicio')}
            />
          </>
        )}
      </ScrollView>

      {modal}
    </SafeAreaView>
  );
}

// Pulseira do cuidador. Props:
//  - modo: 'leituras' (leituras das pulseiras) ou 'painel' (minha pulseira: conectar e opções)
//  - config: vínculo atual vindo da HomeCuidador
//  - pulseira: { id, nome } para abrir direto as leituras de uma pulseira (modo 'leituras')
//  - onMudou: recarrega o vínculo na Home depois de conectar ou desconectar
//  - onVoltar: volta para a tela anterior
export default function PulseiraCuidador({
  modo,
  config,
  pulseira,
  onMudou,
  onVoltar,
}) {
  if (modo === 'leituras') {
    return <Leituras pulseira={pulseira} onVoltar={onVoltar} />;
  }

  return <MinhaPulseira config={config} onMudou={onMudou} onVoltar={onVoltar} />;
}

// Paleta de cores do app Dia a Dia Vovôs
const cores = {
  fundo: '#EAF1FF',
  branco: '#FFFFFF',
  preto: '#000000',
  destaque: '#FFE16A',
  suave: '#E1EAF1',
  rosa: '#F5B4C5',
  verde: '#A6D8B7',
  textoSecundario: '#333333',
  erro: '#B00020',
};

const VARIANTES = {
  primario: { fundo: cores.preto, texto: cores.branco },
  destaque: { fundo: cores.destaque, texto: cores.preto },
  suave: { fundo: cores.suave, texto: cores.preto },
  contorno: { fundo: cores.branco, texto: cores.preto, borda: true },
  perigo: { fundo: cores.erro, texto: cores.branco },
};

const styles = StyleSheet.create({
  telaFixa: {
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
    backgroundColor: cores.branco,
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
    color: cores.preto,
  },
  subtitulo: {
    fontSize: 16,
    color: cores.textoSecundario,
    marginTop: 6,
  },
  corpo: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  lista: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 14,
  },
  carregandoLista: {
    marginVertical: 16,
  },
  card: {
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  cardCentro: {
    alignItems: 'center',
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
  cardTextos: {
    flex: 1,
    flexShrink: 1,
    gap: 2,
  },
  cardTitulo: {
    flexShrink: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: cores.preto,
  },
  // Altura acompanha o conteúdo
  cardLeitura: {
    backgroundColor: cores.rosa,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  cardPulseira: {
    backgroundColor: cores.verde,
    borderRadius: 24,
    padding: 18,
  },
  cardPressionado: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  status: {
    flex: 1,
    flexShrink: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: cores.preto,
  },
  data: {
    flex: 1,
    flexShrink: 1,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: 'bold',
    color: cores.preto,
  },
  // Cada valor ocupa metade da linha; se não couber, quebra para baixo
  linhaValores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  valorBloco: {
    flexGrow: 1,
    flexBasis: '45%',
    flexShrink: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  valorRotulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: cores.preto,
  },
  valor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.preto,
    marginTop: 2,
  },
  texto: {
    fontSize: 20,
    lineHeight: 27,
    color: cores.preto,
  },
  textoCentro: {
    textAlign: 'center',
  },
  aviso: {
    fontSize: 20,
    lineHeight: 27,
    color: cores.preto,
    textAlign: 'center',
  },
  secao: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.preto,
    marginTop: 8,
  },
  input: {
    minHeight: 60,
    backgroundColor: cores.branco,
    borderWidth: 2,
    borderColor: cores.preto,
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 20,
    color: cores.preto,
  },
  passoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  passoNumero: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.preto,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passoNumeroTexto: {
    color: cores.branco,
    fontSize: 18,
    fontWeight: 'bold',
  },
  passoTexto: {
    flex: 1,
    flexShrink: 1,
    fontSize: 20,
    lineHeight: 27,
    color: cores.preto,
  },
  vazio: {
    fontSize: 20,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: 24,
  },
  erro: {
    flex: 1,
    flexShrink: 1,
    fontSize: 20,
    lineHeight: 27,
    color: cores.erro,
  },
  erroTexto: {
    fontSize: 20,
    lineHeight: 27,
    color: cores.erro,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  rodape: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  botao: {
    minHeight: 68,
    paddingHorizontal: 16,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  botaoBorda: {
    borderWidth: 2,
    borderColor: cores.preto,
  },
  botaoApagado: {
    opacity: 0.5,
  },
  botaoTexto: {
    flexShrink: 1,
    fontSize: 21,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Esqueleto de carregamento
  skeletonCard: {
    backgroundColor: '#E3EAF7',
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  skeletonIcone: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  skeletonData: {
    flex: 1,
    height: 22,
    borderRadius: 8,
  },
  skeletonValor: {
    flexGrow: 1,
    flexBasis: '45%',
    flexShrink: 1,
    height: 70,
    borderRadius: 16,
  },
});