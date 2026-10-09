import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { listarLeituras, buscarPulseira } from '../../services/api/api';
import { definirNomePulseira } from '../../services/http/pulseiraHttp';
import { lerPulseira } from '../../services/storage/pulseira';
import { sincronizarAgora, iniciarAutomatico } from '../../services/sync/sync';
import PulseiraIdoso from './PulseiraIdoso';

// Paleta "Dia a Dia Vovôs"
const cores = {
  fundo: '#EAF1FF',
  branco: '#FFFFFF',
  preto: '#000000',
  destaque: '#FFE566',
  suave: '#E1EAF1',
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
      <Text style={[styles.botaoTexto, { color: v.texto }]}>
        {titulo}
      </Text>
    </Pressable>
  );
}

// ISO 8601 ou epoch -> dd/mm/aaaa hh:mm:ss no fuso do celular
function formatarData(valor) {
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

function maisRecente(lista) {
  return [...lista].sort((a, b) => {
    const ta = new Date(a.medidoEm ?? a.medido_em).getTime() || 0;
    const tb = new Date(b.medidoEm ?? b.medido_em).getTime() || 0;
    return tb - ta;
  })[0];
}

// HOME DO IDOSO
export default function HomeIdoso() {
  const navigation = useNavigation();

  const [config, setConfig] = useState(null);
  const [carregado, setCarregado] = useState(false);
  const [tela, setTela] = useState('home');
  const [nome, setNome] = useState('');
  const [ultima, setUltima] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [ocupado, setOcupado] = useState(false);

  // Vínculo salvo no celular
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

  // Sincronização automática
  useEffect(() => {
    if (!config) return undefined;

    const parar = iniciarAutomatico(() => {});

    return () => parar?.();
  }, [config?.idPulseira, config?.ip, config?.deviceToken]);

  // Nome da pulseira
  useEffect(() => {
    if (!config) {
      setNome('');
      return undefined;
    }

    let ativo = true;

    (async () => {
      let p;

      try {
        p = await buscarPulseira(config.idPulseira);
      } catch (e) {
        return;
      }

      if (!ativo || !p?.nome) return;

      setNome(p.nome);

      try {
        await definirNomePulseira(config.ip, p.nome);
      } catch (e) {
        // Pulseira desligada: tenta novamente na próxima abertura.
      }
    })();

    return () => {
      ativo = false;
    };
  }, [config?.idPulseira, config?.ip]);

  // Última leitura
  const carregarUltima = useCallback(async () => {
    if (!config) {
      setUltima(null);
      return;
    }

    try {
      setUltima(
        maisRecente(await listarLeituras(config.idPulseira)) ?? null
      );
    } catch (e) {
      // Sem internet: mantém o que já estava na tela.
    }
  }, [config?.idPulseira]);

  useEffect(() => {
    if (tela === 'home') carregarUltima();
  }, [tela, carregarUltima]);

  const pulseira = useMemo(
    () =>
      config
        ? { id: config.idPulseira, nome: nome || 'Minha pulseira' }
        : null,
    [config?.idPulseira, nome],
  );

  const atualizar = async () => {
    setOcupado(true);
    setMensagem('Atualizando...');

    try {
      await sincronizarAgora(() => {});
      await carregarUltima();
      setMensagem('Tudo atualizado!');
    } catch (e) {
      setMensagem(
        'Não consegui atualizar. Confira se a pulseira está ligada e no mesmo Wi-Fi.'
      );
    } finally {
      setOcupado(false);
    }
  };

  if (!carregado) {
    return (
      <View style={[styles.tela, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={cores.preto} />
      </View>
    );
  }

  if (tela === 'leituras' || tela === 'conectar') {
    return (
      <PulseiraIdoso
        modo={tela}
        pulseira={pulseira}
        onConcluir={recarregar}
        onVoltar={() => setTela('home')}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.tela}>
      <Text style={styles.titulo}>Acompanhe a sua saúde</Text>

      {config ? (
        <>
          <View style={styles.card}>
            <Text style={styles.status}>✓ Pulseira conectada</Text>

            {ultima ? (
              <>
                <Text style={styles.valorGrande}>
                  {ultima.bpm ?? '--'} bpm
                </Text>

                <Text style={styles.valorMedio}>
                  Oxigênio {ultima.spo2 ?? '--'}%
                </Text>

                <Text style={styles.data}>
                  Última leitura:{' '}
                  {formatarData(ultima.medidoEm ?? ultima.medido_em)}
                </Text>
              </>
            ) : (
              <Text style={styles.texto}>
                Ainda não há leituras. Coloque o dedo na pulseira.
              </Text>
            )}
          </View>

          <Botao
            titulo="Ver minhas leituras"
            onPress={() => setTela('leituras')}
          />

          <Botao
            titulo="Atualizar agora"
            variante="destaque"
            onPress={atualizar}
            disabled={ocupado}
          />

          {mensagem ? (
            <Text style={styles.mensagem}>{mensagem}</Text>
          ) : null}
        </>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.status}>Pulseira não conectada</Text>

            <Text style={styles.texto}>
              Ligue a pulseira e toque no botão abaixo.
            </Text>
          </View>

          <Botao
            titulo="Conectar minha pulseira"
            variante="destaque"
            onPress={() => setTela('conectar')}
          />
        </>
      )}

      <Botao
        titulo="Voltar para a home"
        variante="contorno"
        onPress={() => navigation.navigate('HomePrincipal')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flexGrow: 1,
    backgroundColor: cores.fundo,
    padding: 24,
    paddingTop: 60,
    gap: 16,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: cores.preto,
  },
  card: {
    backgroundColor: cores.branco,
    borderWidth: 2,
    borderColor: cores.preto,
    borderRadius: 16,
    padding: 18,
    gap: 8,
  },
  status: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.preto,
  },
  valorGrande: {
    fontSize: 48,
    fontWeight: 'bold',
    color: cores.preto,
  },
  valorMedio: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.preto,
  },
  data: {
    fontSize: 16,
    color: cores.textoSecundario,
  },
  texto: {
    fontSize: 20,
    color: cores.textoSecundario,
  },
  mensagem: {
    fontSize: 20,
    color: cores.preto,
    textAlign: 'center',
  },
  botao: {
    minHeight: 72,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoBorda: {
    borderWidth: 2,
    borderColor: cores.preto,
  },
  botaoApagado: {
    opacity: 0.5,
  },
  botaoTexto: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});