import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';

import { buscarPulseira } from '../../services/api/api';
import { definirNomePulseira } from '../../services/http/pulseiraHttp';
import { lerPulseira } from '../../services/storage/pulseira';
import { iniciarAutomatico } from '../../services/sync/sync';
import PulseiraCuidador from './PulseiraCuidador';

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

// HOME DO CUIDADOR: controle completo.
// Menu para as leituras (todas as pulseiras dele) e para o painel da pulseira
// (conectar, sincronizar, fila, Wi-Fi, desvincular). Props: onSair
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

  // Sincronização automática: liga sozinha quando há pulseira vinculada
  // e desliga quando ela é esquecida
  useEffect(() => {
    if (!config) return undefined;
    const parar = iniciarAutomatico(() => {});
    return () => parar?.();
  }, [config?.idPulseira, config?.ip, config?.deviceToken]);

  // Nome da pulseira: busca na API (GET /pulseira/:id) e manda para ela (POST /nome)
  useEffect(() => {
    if (!config) return undefined;
    let ativo = true;
    (async () => {
      try {
        const p = await buscarPulseira(config.idPulseira);
        if (!ativo || !p?.nome) return;
        await definirNomePulseira(config.ip, p.nome);
      } catch (e) {
        // pulseira desligada ou sem rede: tenta de novo na próxima abertura
      }
    })();
    return () => {
      ativo = false;
    };
  }, [config?.idPulseira, config?.ip]);

  if (!carregado) {
    return (
      <View style={[styles.tela, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={cores.preto} />
      </View>
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

  return (
    <ScrollView contentContainerStyle={styles.tela}>
      <Text style={styles.titulo}>Área do cuidador</Text>

      <View style={styles.card}>
        <Text style={styles.subtitulo}>{config ? '✓ Pulseira vinculada' : 'Nenhuma pulseira vinculada'}</Text>
        <Text style={styles.texto}>
          {config
            ? `Sincronização automática ligada (IP ${config.ip})`
            : 'Abra o painel da pulseira para procurar e vincular.'}
        </Text>
      </View>

      <Botao titulo="Leituras das pulseiras" onPress={() => setTela('leituras')} />
      <Botao titulo="Painel da pulseira" variante="destaque" onPress={() => setTela('painel')} />

      {onSair ? (
        <View style={{ marginTop: 24 }}>
          <Botao titulo="Sair da conta" variante="contorno" onPress={onSair} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flexGrow: 1, backgroundColor: cores.fundo, padding: 24, paddingTop: 60, gap: 16 },
  titulo: { fontSize: 32, fontWeight: 'bold', color: cores.preto },
  card: {
    backgroundColor: cores.branco,
    borderWidth: 2,
    borderColor: cores.preto,
    borderRadius: 16,
    padding: 18,
    gap: 8,
  },
  subtitulo: { fontSize: 24, fontWeight: 'bold', color: cores.preto },
  texto: { fontSize: 20, color: cores.textoSecundario },
  botao: { minHeight: 72, paddingHorizontal: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  botaoBorda: { borderWidth: 2, borderColor: cores.preto },
  botaoApagado: { opacity: 0.5 },
  botaoTexto: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
});