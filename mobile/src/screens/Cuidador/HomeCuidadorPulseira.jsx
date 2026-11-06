import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StatusBar,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { buscarPulseira } from '../../services/api/api';
import { definirNomePulseira } from '../../services/http/pulseiraHttp';
import { lerPulseira } from '../../services/storage/pulseira';
import { iniciarAutomatico } from '../../services/sync/sync';
import { SkeletonTela, SkeletonBloco } from '../../components/Skeleton';
import PulseiraCuidador, {
  usePulseiraOnline,
  useAnimacaoCard,
  infoStatus,
} from './PulseiraCuidador';

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

// Tela inicial da pulseira: menu para as leituras (todas as pulseiras)
// e para o painel da pulseira (conectar, sincronizar, fila, Wi-Fi, desvincular).
// Props: onSair
export default function HomeCuidador({ onSair }) {
  const [config, setConfig] = useState(null);
  const [carregado, setCarregado] = useState(false);
  const [tela, setTela] = useState('home'); // 'home' | 'leituras' | 'painel'

  // Vínculo salvo no celular (id, token e IP da pulseira)
  const recarregar = useCallback(async () => {
    try {
      setConfig(await lerPulseira());
    } finally {
      setCarregado(true);
    }
  }, []);

  useEffect(() => {
    recarregar().catch(() => {});
  }, [recarregar]);

  // Sincronização automática: liga quando há pulseira vinculada
  // e desliga quando ela é esquecida
  useEffect(() => {
    if (!config) return undefined;

    const parar = iniciarAutomatico(() => {});

    return () => parar?.();
  }, [config?.idPulseira, config?.ip, config?.deviceToken]);

  // Nome da pulseira: busca na API (GET /pulseira/:id) e envia para ela (POST /nome)
  useEffect(() => {
    if (!config) return undefined;

    let ativo = true;

    (async () => {
      try {
        const p = await buscarPulseira(config.idPulseira);

        if (!ativo || !p?.nome) return;

        await definirNomePulseira(config.ip, p.nome);
      } catch (e) {
        // Pulseira desligada ou sem rede: tenta de novo na próxima abertura
      }
    })();

    return () => {
      ativo = false;
    };
  }, [config?.idPulseira, config?.ip]);

  // Verifica se a pulseira responde (só enquanto a home está aberta)
  const { online } = usePulseiraOnline(config?.ip, tela === 'home' && !!config);

  const buscando = !!config && tela === 'home' && online === null;

  const { estiloAnimado } = useAnimacaoCard(buscando);

  // Enquanto carrega o vínculo, mostra o esqueleto da tela
  if (!carregado) {
    return (
      <SkeletonTela rotulo="Carregando a área do cuidador">
        <View style={styles.skeletonConteudo}>
          <SkeletonBloco style={styles.skeletonTitulo} />
          <SkeletonBloco style={styles.skeletonSubtitulo} />

          <View style={styles.skeletonCard}>
            <View style={styles.cardTopo}>
              <SkeletonBloco style={styles.skeletonIcone} />
              <SkeletonBloco style={styles.skeletonStatus} />
            </View>

            <SkeletonBloco style={styles.skeletonLinha} />
          </View>

          <SkeletonBloco style={styles.skeletonBotao} />
          <SkeletonBloco style={styles.skeletonBotao} />
        </View>
      </SkeletonTela>
    );
  }

  if (tela === 'leituras' || tela === 'painel') {
    return (
      <PulseiraCuidador
        modo={tela}
        config={config}
        onMudou={recarregar}
        onVoltar={() => setTela('home')}
      />
    );
  }

  const st = infoStatus(buscando, online);

  let detalhe = 'Ligue a pulseira e confira se está no mesmo Wi-Fi.';

  if (buscando) {
    detalhe = 'Isso leva alguns segundos.';
  } else if (online) {
    detalhe = `Sincronização automática ligada (IP ${config?.ip})`;
  }

  return (
    <SafeAreaView style={styles.tela}>
      <StatusBar backgroundColor={cores.fundo} barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.titulo}>Área do cuidador</Text>

          <Text style={styles.subtitulo}>
            Acompanhe as pulseiras e a saúde
          </Text>
        </View>

        {config ? (
          // Card de status: a altura acompanha o conteúdo
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
        ) : (
          <View style={[styles.card, { backgroundColor: cores.destaque }]}>
            <View style={styles.cardTopo}>
              <View style={styles.cardIcone}>
                <MaterialCommunityIcons
                  name="link-off"
                  size={34}
                  color={cores.preto}
                />
              </View>

              <Text style={styles.status}>Nenhuma pulseira vinculada</Text>
            </View>

            <Text style={styles.texto}>
              Abra o painel da pulseira para procurar e vincular.
            </Text>
          </View>
        )}

        <Botao
          titulo="Leituras das pulseiras"
          icone="chart-line"
          onPress={() => setTela('leituras')}
        />

        <Botao
          titulo="Painel da pulseira"
          icone="watch"
          variante="destaque"
          onPress={() => setTela('painel')}
        />

        {onSair ? (
          <View style={styles.sair}>
            <Botao
              titulo="Sair da conta"
              icone="logout"
              variante="contorno"
              onPress={onSair}
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// Paleta de cores
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
};

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    marginBottom: 8,
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
  card: {
    borderRadius: 24,
    padding: 18,
    gap: 14,
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
  status: {
    flex: 1,
    flexShrink: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: cores.preto,
  },
  texto: {
    fontSize: 20,
    lineHeight: 27,
    color: cores.preto,
  },
  sair: {
    marginTop: 8,
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
  skeletonConteudo: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 16,
  },
  skeletonTitulo: {
    width: 230,
    maxWidth: '100%',
    height: 30,
    borderRadius: 10,
  },
  skeletonSubtitulo: {
    width: 260,
    maxWidth: '100%',
    height: 16,
    borderRadius: 8,
  },
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
  skeletonStatus: {
    flex: 1,
    height: 26,
    borderRadius: 10,
  },
  skeletonLinha: {
    width: '70%',
    height: 20,
    borderRadius: 8,
  },
  skeletonBotao: {
    height: 68,
    borderRadius: 22,
  },
});