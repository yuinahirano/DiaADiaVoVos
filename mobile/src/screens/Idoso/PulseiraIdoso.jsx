import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, FlatList, Pressable, ActivityIndicator, StyleSheet } from 'react-native';

import { listarPulseiras, listarLeituras, vincularPulseira } from '../../services/api/api';
import { testarPulseira, procurarPulseiras } from '../../services/http/pulseiraHttp';
import { salvarPulseira } from '../../services/storage/pulseira';

// Paleta "Dia a Dia Vovôs"
const cores = {
  fundo: '#EAF1FF', // azul muito claro
  branco: '#FFFFFF',
  preto: '#000000',
  destaque: '#FFE566', // amarelo dos botões
  suave: '#E1EAF1', // azul-claro dos campos
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
  const [carregando, setCarregando] = useState(false);
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

  return (
    <View style={styles.telaFixa}>
      <Text style={styles.titulo}>Minhas leituras</Text>
      <Text style={styles.info}>
        {pulseira?.nome} • {leituras.length} {leituras.length === 1 ? 'leitura' : 'leituras'}
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
              <Text style={styles.valor}>SpO2 {item.spo2 ?? '--'}%</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.rodape}>
        <Botao titulo="Atualizar" variante="destaque" onPress={carregar} disabled={carregando} />
        <Botao titulo="Voltar" variante="contorno" onPress={onVoltar} />
      </View>
    </View>
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
    <ScrollView contentContainerStyle={styles.telaRolavel}>
      <Text style={styles.titulo}>Conectar pulseira</Text>

      {passo === 'inicio' && (
        <>
          <View style={styles.card}>
            <Text style={styles.texto}>1. Ligue a pulseira.</Text>
            <Text style={styles.texto}>2. Deixe o celular no mesmo Wi-Fi.</Text>
            <Text style={styles.texto}>3. Toque no botão abaixo.</Text>
          </View>
          <Botao titulo="Procurar minha pulseira" variante="destaque" onPress={iniciar} />
          <Botao titulo="Voltar" variante="contorno" onPress={onVoltar} />
        </>
      )}

      {passo === 'procurando' && (
        <View style={styles.card}>
          <ActivityIndicator size="large" color={cores.preto} />
          <Text style={styles.texto}>Procurando sua pulseira... isso leva alguns segundos.</Text>
        </View>
      )}

      {passo === 'escolher' && (
        <>
          <Text style={styles.texto}>Qual é a sua pulseira?</Text>
          {escolhas.map((p) => (
            <Botao key={p.id} titulo={p.nome} variante="suave" onPress={() => escolher(p)} />
          ))}
          <Botao titulo="Voltar" variante="contorno" onPress={onVoltar} />
        </>
      )}

      {passo === 'ok' && (
        <>
          <View style={styles.card}>
            <Text style={styles.sucesso}>✓ Pronto! Pulseira conectada.</Text>
          </View>
          <Botao titulo="Continuar" variante="destaque" onPress={concluir} />
        </>
      )}

      {passo === 'erro' && (
        <>
          <View style={styles.card}>
            <Text style={styles.erro}>{mensagem}</Text>
          </View>
          <Botao titulo="Tentar de novo" variante="destaque" onPress={iniciar} />
          <Botao titulo="Voltar" variante="contorno" onPress={onVoltar} />
        </>
      )}
    </ScrollView>
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
  telaFixa: { flex: 1, backgroundColor: cores.fundo, padding: 24, paddingTop: 60 },
  telaRolavel: { flexGrow: 1, backgroundColor: cores.fundo, padding: 24, paddingTop: 60, gap: 16 },
  titulo: { fontSize: 32, fontWeight: 'bold', color: cores.preto, marginBottom: 8 },
  info: { fontSize: 20, color: cores.textoSecundario, marginBottom: 12 },
  card: {
    backgroundColor: cores.branco,
    borderWidth: 2,
    borderColor: cores.preto,
    borderRadius: 16,
    padding: 18,
    gap: 8,
  },
  data: { fontSize: 16, color: cores.textoSecundario },
  linhaValores: { flexDirection: 'row', justifyContent: 'space-between' },
  valor: { fontSize: 24, fontWeight: 'bold', color: cores.preto },
  texto: { fontSize: 20, color: cores.preto },
  sucesso: { fontSize: 24, fontWeight: 'bold', color: cores.preto },
  vazio: { fontSize: 20, color: cores.textoSecundario, textAlign: 'center', marginTop: 24 },
  erro: { fontSize: 20, color: cores.erro },
  rodape: { gap: 12, marginTop: 16 },
  botao: { minHeight: 72, paddingHorizontal: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  botaoBorda: { borderWidth: 2, borderColor: cores.preto },
  botaoApagado: { opacity: 0.5 },
  botaoTexto: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
});