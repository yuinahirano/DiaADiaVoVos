import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { listarPulseiras, listarLeituras, vincularPulseira } from '../../services/api/api';
import { testarPulseira, procurarPulseiras } from '../../services/http/pulseiraHttp';
import { salvarPulseira } from '../../services/storage/pulseira';
import {
  SkeletonTela,
  SkeletonCabecalho,
  SkeletonBloco,
} from '../../components/Skeleton';

// Paleta "Dia a Dia Vovôs"
const cores = {
  fundo: '#EAF1FF', // azul muito claro
  branco: '#FFFFFF',
  preto: '#000000',
  destaque: '#FFE16A', // amarelo dos botões
  suave: '#E1EAF1', // azul-claro dos campos
  rosa: '#F5B4C5', // cor do card Saúde
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

// Botão grande, fácil de tocar
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
      {icone ? <MaterialCommunityIcons name={icone} size={26} color={v.texto} /> : null}
      <Text style={[styles.botaoTexto, { color: v.texto }]}>{titulo}</Text>
    </Pressable>
  );
}

// ISO 8601 (com "Z" = UTC) ou epoch -> dd/mm/aaaa hh:mm:ss no fuso do celular
function formatarData(valor) {
  if (valor === undefined || valor === null) return '--';
  const d = typeof valor === 'number' ? new Date(valor < 1e12 ? valor * 1000 : valor) : new Date(valor);
  if (Number.isNaN(d.getTime())) return String(valor);
  const dois = (n) => String(n).padStart(2, '0');
  return (
    `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()} ` +
    `${dois(d.getHours())}:${dois(d.getMinutes())}:${dois(d.getSeconds())}`
  );
}

// Erro com mensagem já pronta para mostrar ao idoso
function amigavel(texto) {
  const e = new Error(texto);
  e.amigavel = true;
  return e;
}

// ---------------------------------------------------------------------------
// LEITURAS: abre direto as leituras da pulseira dele (sem lista de pulseiras)
// ---------------------------------------------------------------------------
function Leituras({ pulseira, onVoltar }) {
  const [leituras, setLeituras] = useState([]);
  const [carregando, setCarregando] = useState(!!pulseira);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    if (!pulseira) return;
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
      setErro('Não consegui buscar as leituras. Confira a internet e tente de novo.');
      setLeituras([]);
    } finally {
      setCarregando(false);
    }
  }, [pulseira?.id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Primeira carga: mostra o esqueleto dos cards
  if (carregando && leituras.length === 0) {
    return (
      <SkeletonTela rotulo="Carregando leituras">
        <SkeletonCabecalho />

        <View style={styles.lista}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.cardTopo}>
                <SkeletonBloco style={styles.skeletonIcone} />
                <SkeletonBloco style={styles.skeletonData} />
              </View>

              <View style={styles.linhaValores}>
                <SkeletonBloco style={styles.skeletonValor} />
                <SkeletonBloco style={styles.skeletonValor} />
              </View>
            </View>
          ))}
        </View>
      </SkeletonTela>
    );
  }

  return (
    <SafeAreaView style={styles.telaFixa}>
      <StatusBar backgroundColor={cores.fundo} barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable
          style={styles.botaoHeader}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={onVoltar}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color={cores.preto} />
        </Pressable>

        <View style={styles.tituloContainer}>
          <Text style={styles.titulo}>Minhas leituras</Text>
          <Text style={styles.subtitulo}>
            {pulseira?.nome} • {leituras.length} {leituras.length === 1 ? 'leitura' : 'leituras'}
          </Text>
        </View>
      </View>

      {erro ? <Text style={styles.erroTexto}>{erro}</Text> : null}
      {carregando ? <ActivityIndicator size="large" color={cores.preto} style={{ marginVertical: 16 }} /> : null}

      <FlatList
        data={leituras}
        keyExtractor={(item, i) => String(item.id ?? item.seq ?? `${item.medidoEm ?? item.medido_em}-${i}`)}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !carregando && !erro ? <Text style={styles.vazio}>Ainda não há leituras desta pulseira</Text> : null
        }
        renderItem={({ item }) => (
          // Sem altura fixa: o card cresce com o conteúdo
          <View style={styles.cardLeitura}>
            <View style={styles.cardTopo}>
              <View style={styles.cardIcone}>
                <MaterialCommunityIcons name="heart-pulse" size={30} color={cores.preto} />
              </View>
              <Text style={styles.data}>{formatarData(item.medidoEm ?? item.medido_em)}</Text>
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
        <Botao titulo="Atualizar" icone="refresh" variante="destaque" onPress={carregar} disabled={carregando} />
        <Botao titulo="Voltar" icone="arrow-left" variante="contorno" onPress={onVoltar} />
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// CONECTAR: um toque. Procura a pulseira na rede, testa e vincula sozinho.
// Só pede escolha se a conta tiver mais de uma pulseira cadastrada.
// ---------------------------------------------------------------------------
function Conectar({ onConcluir, onVoltar }) {
  const [passo, setPasso] = useState('inicio'); // inicio | procurando | escolher | ok | erro
  const [mensagem, setMensagem] = useState('');
  const [escolhas, setEscolhas] = useState([]);
  const [alvoIp, setAlvoIp] = useState('');

  const vincular = async (pulseira, ip) => {
    const deviceToken = await vincularPulseira(pulseira.id);
    await salvarPulseira({ idPulseira: pulseira.id, deviceToken, ip });
    setPasso('ok');
  };

  const iniciar = async () => {
    setPasso('procurando');
    setMensagem('');
    try {
      const achadas = await procurarPulseiras();
      if (achadas.length === 0) {
        throw amigavel('Não encontrei a pulseira. Veja se ela está ligada e se o celular está no mesmo Wi-Fi.');
      }
      if (achadas.length > 1) {
        throw amigavel('Encontrei mais de uma pulseira por perto. Peça ajuda ao seu cuidador.');
      }
      const ip = achadas[0].ip;
      await testarPulseira(ip);

      const lista = await listarPulseiras();
      if (lista.length === 0) {
        throw amigavel('Sua conta ainda não tem uma pulseira cadastrada. Peça ajuda ao seu cuidador.');
      }
      if (lista.length > 1) {
        setAlvoIp(ip);
        setEscolhas(lista);
        setPasso('escolher');
        return;
      }
      await vincular(lista[0], ip);
    } catch (e) {
      setMensagem(e.amigavel ? e.message : 'Não consegui conectar. Tente de novo ou peça ajuda ao seu cuidador.');
      setPasso('erro');
    }
  };

  const escolher = async (pulseira) => {
    setPasso('procurando');
    try {
      await vincular(pulseira, alvoIp);
    } catch (e) {
      setMensagem('Não consegui conectar. Tente de novo ou peça ajuda ao seu cuidador.');
      setPasso('erro');
    }
  };

  const concluir = async () => {
    await onConcluir?.();
    onVoltar?.();
  };

  return (
    <SafeAreaView style={styles.telaFixa}>
      <StatusBar backgroundColor={cores.fundo} barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.telaRolavel} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.tituloContainer}>
            <Text style={styles.titulo}>Conectar pulseira</Text>
            <Text style={styles.subtitulo}>Ligue a sua pulseira ao aplicativo</Text>
          </View>
        </View>

        {passo === 'inicio' && (
          <>
            <View style={[styles.card, { backgroundColor: cores.destaque }]}>
              <View style={styles.passo}>
                <View style={styles.passoNumero}>
                  <Text style={styles.passoNumeroTexto}>1</Text>
                </View>
                <Text style={styles.passoTexto}>Ligue a pulseira.</Text>
              </View>

              <View style={styles.passo}>
                <View style={styles.passoNumero}>
                  <Text style={styles.passoNumeroTexto}>2</Text>
                </View>
                <Text style={styles.passoTexto}>Deixe o celular no mesmo Wi-Fi.</Text>
              </View>

              <View style={styles.passo}>
                <View style={styles.passoNumero}>
                  <Text style={styles.passoNumeroTexto}>3</Text>
                </View>
                <Text style={styles.passoTexto}>Toque no botão abaixo.</Text>
              </View>
            </View>
            <Botao titulo="Procurar minha pulseira" icone="magnify" variante="destaque" onPress={iniciar} />
            <Botao titulo="Voltar" icone="arrow-left" variante="contorno" onPress={onVoltar} />
          </>
        )}

        {passo === 'procurando' && (
          <View style={[styles.card, { backgroundColor: cores.rosa, alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={cores.preto} />
            <Text style={[styles.texto, { textAlign: 'center' }]}>
              Procurando sua pulseira... isso leva alguns segundos.
            </Text>
          </View>
        )}

        {passo === 'escolher' && (
          <>
            <Text style={styles.texto}>Qual é a sua pulseira?</Text>
            {escolhas.map((p) => (
              <Botao key={p.id} titulo={p.nome} icone="watch" variante="suave" onPress={() => escolher(p)} />
            ))}
            <Botao titulo="Voltar" icone="arrow-left" variante="contorno" onPress={onVoltar} />
          </>
        )}

        {passo === 'ok' && (
          <>
            <View style={[styles.card, { backgroundColor: cores.verde }]}>
              <View style={styles.cardTopo}>
                <View style={styles.cardIcone}>
                  <MaterialCommunityIcons name="check-circle-outline" size={34} color={cores.preto} />
                </View>
                <Text style={styles.sucesso}>✓ Pronto! Pulseira conectada.</Text>
              </View>
            </View>
            <Botao titulo="Continuar" icone="arrow-right" variante="destaque" onPress={concluir} />
          </>
        )}

        {passo === 'erro' && (
          <>
            <View style={[styles.card, { backgroundColor: cores.branco }]}>
              <View style={styles.cardTopo}>
                <View style={[styles.cardIcone, { backgroundColor: cores.suave }]}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={34} color={cores.erro} />
                </View>
                <Text style={styles.erro}>{mensagem}</Text>
              </View>
            </View>
            <Botao titulo="Tentar de novo" icone="refresh" variante="destaque" onPress={iniciar} />
            <Botao titulo="Voltar" icone="arrow-left" variante="contorno" onPress={onVoltar} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// PULSEIRA DO IDOSO. Props:
//  - modo: 'leituras' (ver leituras) ou 'conectar' (vincular a pulseira)
//  - pulseira: { id, nome } da pulseira vinculada (usada em 'leituras')
//  - onConcluir: recarrega o vínculo na Home depois de conectar
//  - onVoltar: volta para a Home do idoso
export default function PulseiraIdoso({ modo, pulseira, onConcluir, onVoltar }) {
  if (modo === 'conectar') return <Conectar onConcluir={onConcluir} onVoltar={onVoltar} />;
  return <Leituras pulseira={pulseira} onVoltar={onVoltar} />;
}

const styles = StyleSheet.create({
  telaFixa: { flex: 1, backgroundColor: cores.fundo },
  telaRolavel: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24, gap: 16 },
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
  tituloContainer: { flex: 1 },
  titulo: { fontSize: 30, fontWeight: 'bold', color: cores.preto },
  subtitulo: { fontSize: 16, color: cores.textoSecundario, marginTop: 6 },
  lista: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 16, gap: 14 },
  card: {
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  cardTopo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cardIcone: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Sem altura fixa: o card acompanha o conteúdo
  cardLeitura: {
    backgroundColor: cores.rosa,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  data: { flex: 1, flexShrink: 1, fontSize: 17, lineHeight: 23, fontWeight: 'bold', color: cores.preto },
  // Cada valor ocupa metade da linha; se não couber, quebra para baixo
  linhaValores: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  valorBloco: {
    flexGrow: 1,
    flexBasis: '45%',
    flexShrink: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  valorRotulo: { fontSize: 14, fontWeight: 'bold', color: cores.preto },
  valor: { fontSize: 24, fontWeight: 'bold', color: cores.preto, marginTop: 2 },
  texto: { fontSize: 20, lineHeight: 27, color: cores.preto },
  passo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  passoNumero: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.preto,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passoNumeroTexto: { color: cores.branco, fontSize: 18, fontWeight: 'bold' },
  passoTexto: { flex: 1, flexShrink: 1, fontSize: 20, lineHeight: 27, color: cores.preto },
  sucesso: { flex: 1, flexShrink: 1, fontSize: 22, fontWeight: 'bold', color: cores.preto },
  vazio: { fontSize: 20, color: cores.textoSecundario, textAlign: 'center', marginTop: 24 },
  erro: { flex: 1, flexShrink: 1, fontSize: 20, lineHeight: 27, color: cores.erro },
  erroTexto: { fontSize: 20, lineHeight: 27, color: cores.erro, paddingHorizontal: 16, marginBottom: 8 },
  rodape: { gap: 12, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 },
  botao: {
    minHeight: 68,
    paddingHorizontal: 16,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  botaoBorda: { borderWidth: 2, borderColor: cores.preto },
  botaoApagado: { opacity: 0.5 },
  botaoTexto: { flexShrink: 1, fontSize: 21, fontWeight: 'bold', textAlign: 'center' },
  // Esqueleto de carregamento das leituras
  skeletonCard: {
    backgroundColor: '#E3EAF7',
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  skeletonIcone: { width: 56, height: 56, borderRadius: 28 },
  skeletonData: { flex: 1, height: 22, borderRadius: 8 },
  skeletonValor: {
    flexGrow: 1,
    flexBasis: '45%',
    flexShrink: 1,
    height: 70,
    borderRadius: 16,
  },
});