import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';

import { testarPulseira, procurarPulseiras, acharPorNome, esquecerWifiPulseira } from '../../services/http/pulseiraHttp';
import { listarPulseiras, listarLeituras, vincularPulseira } from '../../services/api/api';
import { esquecerPulseira, salvarPulseira } from '../../services/storage/pulseira';
import { sincronizarAgora } from '../../services/sync/sync';

// Paleta "Dia a Dia Vovôs"
const cores = {
  fundo: '#E1F5FE', // azul gelo
  branco: '#FFFFFF',
  preto: '#000000',
  destaque: '#FFD600', // amarelo forte
  suave: '#B39DDB', // roxo suave
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

// Botão grande, fácil de tocar
function Botao({ titulo, onPress, disabled, variante = 'primario' }) {
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

// Erro com mensagem já pronta para mostrar ao cuidador
function amigavel(texto) {
  const e = new Error(texto);
  e.amigavel = true;
  return e;
}

// ---------------------------------------------------------------------------
// LEITURAS: lista as pulseiras e, ao tocar, mostra as leituras dela
// ---------------------------------------------------------------------------
function Leituras({ onVoltar }) {
  const [pulseiras, setPulseiras] = useState([]);
  const [selecionada, setSelecionada] = useState(null); // { id, nome }
  const [leituras, setLeituras] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const carregarLista = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setPulseiras(await listarPulseiras());
    } catch (e) {
      setErro('Não consegui buscar as pulseiras. Confira a internet e tente de novo.');
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
      setErro('Não consegui buscar as leituras. Confira a internet e tente de novo.');
      setLeituras([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarLista();
  }, [carregarLista]);

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

  // Leituras da pulseira escolhida
  if (selecionada) {
    return (
      <View style={styles.telaFixa}>
        <Text style={styles.titulo}>{selecionada.nome}</Text>
        <Text style={styles.info}>
          {leituras.length} {leituras.length === 1 ? 'leitura' : 'leituras'}
        </Text>

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}
        {carregando ? <ActivityIndicator size="large" color={cores.preto} style={{ marginVertical: 16 }} /> : null}

        <FlatList
          data={leituras}
          keyExtractor={(item, i) => String(item.id ?? item.seq ?? `${item.medidoEm ?? item.medido_em}-${i}`)}
          contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
          ListEmptyComponent={
            !carregando && !erro ? <Text style={styles.vazio}>Ainda não há leituras desta pulseira</Text> : null
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.data}>{formatarData(item.medidoEm ?? item.medido_em)}</Text>
              <View style={styles.linhaValores}>
                <Text style={styles.valor}>{item.bpm ?? '--'} bpm</Text>
                <Text style={styles.valor}>Oxigênio {item.spo2 ?? '--'}%</Text>
              </View>
            </View>
          )}
        />

        <View style={styles.rodape}>
          <Botao
            titulo="Atualizar"
            variante="destaque"
            onPress={() => carregarLeituras(selecionada)}
            disabled={carregando}
          />
          <Botao titulo="Voltar" variante="contorno" onPress={voltarParaLista} />
        </View>
      </View>
    );
  }

  // Lista de pulseiras
  return (
    <ScrollView contentContainerStyle={styles.telaRolavel}>
      <Text style={styles.titulo}>Pulseiras</Text>
      <Text style={styles.info}>Toque em uma pulseira para ver as leituras dela</Text>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
      {carregando ? <ActivityIndicator size="large" color={cores.preto} style={{ marginVertical: 16 }} /> : null}

      <View style={styles.lista}>
        {pulseiras.map((p) => (
          <Pressable key={p.id} style={styles.card} onPress={() => abrir(p)}>
            <Text style={styles.cardTitulo}>{p.nome}</Text>
            <Text style={styles.data}>Ver leituras</Text>
          </Pressable>
        ))}
        {!carregando && !erro && pulseiras.length === 0 ? (
          <Text style={styles.vazio}>Nenhuma pulseira encontrada</Text>
        ) : null}
      </View>

      <View style={styles.rodape}>
        <Botao titulo="Atualizar lista" variante="destaque" onPress={carregarLista} disabled={carregando} />
        <Botao titulo="Voltar" variante="contorno" onPress={onVoltar} />
      </View>
    </ScrollView>
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

  const falhou = (e) => {
    setMensagem(e.amigavel ? e.message : 'Não consegui conectar. Tente de novo.');
    setPasso('erro');
  };

  // Guarda o vínculo no celular; a tela muda sozinha para "pulseira conectada"
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
    setOcupado(true);
    setAviso('Atualizando...');
    try {
      await sincronizarAgora(() => {});
      setAviso('Tudo atualizado!');
    } catch (e) {
      setAviso('Não consegui atualizar. Confira se a pulseira está ligada e no mesmo Wi-Fi.');
    } finally {
      setOcupado(false);
    }
  };

  const fazerTrocaDeWifi = async () => {
    setOcupado(true);
    try {
      await esquecerWifiPulseira(config.ip);
      await esquecerPulseira();
      await onMudou();
      setAviso('A pulseira esqueceu o Wi-Fi. Conecte o celular na rede que ela abriu e escolha o novo Wi-Fi.');
    } catch (e) {
      setAviso('Não consegui falar com a pulseira. Veja se ela está ligada e no mesmo Wi-Fi.');
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

  // Pede confirmação antes de ações que desfazem a conexão
  const confirmar = (titulo, texto, acao) =>
    Alert.alert(titulo, texto, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Continuar', onPress: acao },
    ]);

  // ----- Pulseira já conectada -----
  if (config) {
    return (
      <ScrollView contentContainerStyle={styles.telaRolavel}>
        <Text style={styles.titulo}>Minha pulseira</Text>

        <View style={styles.bloco}>
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>✓ Pulseira conectada</Text>
            <Text style={styles.info}>As leituras são enviadas sozinhas para o aplicativo.</Text>
          </View>

          {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}

          <Botao titulo="Atualizar agora" variante="destaque" onPress={atualizar} disabled={ocupado} />
          <Botao
            titulo="Trocar o Wi-Fi da pulseira"
            variante="suave"
            disabled={ocupado}
            onPress={() =>
              confirmar(
                'Trocar o Wi-Fi da pulseira',
                'A pulseira vai esquecer a rede atual e abrir uma rede própria para você escolher outra. Deseja continuar?',
                fazerTrocaDeWifi,
              )
            }
          />
          <Botao
            titulo="Desconectar pulseira"
            variante="perigo"
            disabled={ocupado}
            onPress={() =>
              confirmar(
                'Desconectar pulseira',
                'Este celular vai deixar de receber as leituras desta pulseira. Deseja continuar?',
                fazerDesconexao,
              )
            }
          />
          <Botao titulo="Voltar" variante="contorno" onPress={onVoltar} />
        </View>
      </ScrollView>
    );
  }

  // ----- Pulseira ainda não conectada -----
  return (
    <ScrollView contentContainerStyle={styles.telaRolavel}>
      <Text style={styles.titulo}>Conectar pulseira</Text>

      {passo === 'inicio' && (
        <View style={styles.bloco}>
          {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}

          <View style={styles.card}>
            <Text style={styles.info}>1. Ligue a pulseira.</Text>
            <Text style={styles.info}>2. Deixe o celular no mesmo Wi-Fi que ela.</Text>
            <Text style={styles.info}>3. Toque no botão abaixo.</Text>
          </View>

          <Botao titulo="Procurar pulseira" variante="destaque" onPress={() => procurar()} />

          <Text style={styles.subtitulo}>Não encontrou?</Text>
          <TextInput
            style={styles.input}
            value={nomeBusca}
            onChangeText={setNomeBusca}
            placeholder="Nome que aparece na pulseira"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Botao titulo="Procurar pelo nome" variante="suave" onPress={procurarPeloNome} />

          <Botao titulo="Voltar" variante="contorno" onPress={onVoltar} />
        </View>
      )}

      {passo === 'procurando' && (
        <View style={styles.card}>
          <ActivityIndicator size="large" color={cores.preto} />
          <Text style={styles.info}>Procurando a pulseira... isso leva alguns segundos.</Text>
        </View>
      )}

      {passo === 'escolherPulseira' && (
        <View style={styles.bloco}>
          <Text style={styles.info}>Encontrei mais de uma pulseira. Qual você quer conectar?</Text>
          {achadas.map((p) => (
            <Botao key={p.ip} titulo={p.nome} variante="suave" onPress={() => conectarEm(p)} />
          ))}
          <Botao titulo="Voltar" variante="contorno" onPress={() => setPasso('inicio')} />
        </View>
      )}

      {passo === 'escolherCadastro' && (
        <View style={styles.bloco}>
          <Text style={styles.info}>Qual é esta pulseira?</Text>
          {cadastradas.map((p) => (
            <Botao key={p.id} titulo={p.nome} variante="suave" onPress={() => escolherCadastro(p)} />
          ))}
          <Botao titulo="Voltar" variante="contorno" onPress={() => setPasso('inicio')} />
        </View>
      )}

      {passo === 'erro' && (
        <View style={styles.bloco}>
          <View style={styles.card}>
            <Text style={styles.erroGrande}>{mensagem}</Text>
          </View>
          <Botao titulo="Tentar de novo" variante="destaque" onPress={() => setPasso('inicio')} />
          <Botao titulo="Voltar" variante="contorno" onPress={onVoltar} />
        </View>
      )}
    </ScrollView>
  );
}

// PULSEIRA DO CUIDADOR. Props:
//  - modo: 'leituras' (leituras das pulseiras) ou 'painel' (minha pulseira: conectar e opções)
//  - config: vínculo atual vindo da HomeCuidador
//  - onMudou: recarrega o vínculo na Home depois de conectar/desconectar
//  - onVoltar: volta para a Home do cuidador
export default function PulseiraCuidador({ modo, config, onMudou, onVoltar }) {
  if (modo === 'leituras') return <Leituras onVoltar={onVoltar} />;
  return <MinhaPulseira config={config} onMudou={onMudou} onVoltar={onVoltar} />;
}

const styles = StyleSheet.create({
  telaFixa: { flex: 1, backgroundColor: cores.fundo, padding: 24, paddingTop: 60 },
  telaRolavel: { flexGrow: 1, backgroundColor: cores.fundo, padding: 24, paddingTop: 60 },
  titulo: { fontSize: 32, fontWeight: 'bold', color: cores.preto, marginBottom: 12 },
  subtitulo: { fontSize: 24, fontWeight: 'bold', color: cores.preto, marginTop: 8 },
  info: { fontSize: 20, color: cores.preto },
  aviso: { fontSize: 20, color: cores.preto, textAlign: 'center' },
  bloco: { gap: 12 },
  lista: { gap: 12, marginTop: 8 },
  card: {
    backgroundColor: cores.branco,
    borderWidth: 2,
    borderColor: cores.preto,
    borderRadius: 16,
    padding: 18,
    gap: 8,
  },
  cardTitulo: { fontSize: 24, fontWeight: 'bold', color: cores.preto },
  data: { fontSize: 16, color: cores.textoSecundario },
  linhaValores: { flexDirection: 'row', justifyContent: 'space-between' },
  valor: { fontSize: 24, fontWeight: 'bold', color: cores.preto },
  vazio: { fontSize: 20, color: cores.textoSecundario, textAlign: 'center', marginTop: 24 },
  erro: { fontSize: 18, color: cores.erro, marginVertical: 8 },
  erroGrande: { fontSize: 20, color: cores.erro },
  rodape: { gap: 12, marginTop: 16 },
  input: {
    backgroundColor: cores.branco,
    borderWidth: 2,
    borderColor: cores.preto,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 20,
  },
  botao: { minHeight: 72, paddingHorizontal: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  botaoBorda: { borderWidth: 2, borderColor: cores.preto },
  botaoApagado: { opacity: 0.5 },
  botaoTexto: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
});