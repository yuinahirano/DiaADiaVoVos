import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Animated, Easing, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COR_BLOCO = '#D3DCEE';

// Animação de pulso única, compartilhada por todos os blocos da tela
const PulsoContext = createContext(null);

function PulsoProvider({ children }) {
  const opacidade = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animacao = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidade, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacidade, {
          toValue: 0.45,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animacao.start();

    return () => animacao.stop();
  }, [opacidade]);

  return (
    <PulsoContext.Provider value={opacidade}>{children}</PulsoContext.Provider>
  );
}

// Bloco que pulsa. Aceita style, ou largura, altura e raio diretamente.
export function SkeletonBloco({ style, largura, altura, raio }) {
  const opacidade = useContext(PulsoContext);

  // Fora de uma SkeletonTela, cria o próprio pulso
  if (!opacidade) {
    return (
      <PulsoProvider>
        <SkeletonBloco
          style={style}
          largura={largura}
          altura={altura}
          raio={raio}
        />
      </PulsoProvider>
    );
  }

  return (
    <Animated.View
      style={[
        styles.bloco,
        largura !== undefined && { width: largura },
        altura !== undefined && { height: altura },
        raio !== undefined && { borderRadius: raio },
        style,
        { opacity: opacidade },
      ]}
    />
  );
}

// Moldura de uma tela em carregamento: fundo, área segura, barra de status,
// pulso compartilhado e rótulo para leitor de tela
export function SkeletonTela({ children, rotulo = 'Carregando' }) {
  return (
    <SafeAreaView
      style={styles.tela}
      accessible
      accessibilityLabel={rotulo}
      accessibilityState={{ busy: true }}
    >
      <StatusBar backgroundColor="#EAF1FF" barStyle="dark-content" />

      <PulsoProvider>{children}</PulsoProvider>
    </SafeAreaView>
  );
}

// Cabeçalho das telas internas: botão voltar, título e subtítulo
export function SkeletonCabecalho() {
  return (
    <View style={styles.cabecalho}>
      <SkeletonBloco style={styles.cabecalhoBotao} />

      <View style={styles.cabecalhoTextos}>
        <SkeletonBloco style={styles.cabecalhoTitulo} />
        <SkeletonBloco style={styles.cabecalhoSubtitulo} />
      </View>
    </View>
  );
}

// Card de lista (mesmo formato de Consultas e Notificações)
export function SkeletonCardLista() {
  return (
    <View style={styles.cardLista}>
      <View style={styles.cardListaTopo}>
        <SkeletonBloco style={styles.cardListaIcone} />

        <View style={styles.cardListaTextos}>
          <SkeletonBloco style={styles.cardListaTitulo} />
          <SkeletonBloco style={styles.cardListaSelo} />
        </View>
      </View>

      <View style={styles.cardListaCampos}>
        <SkeletonBloco style={styles.cardListaCampo} />
        <SkeletonBloco style={styles.cardListaCampo} />
      </View>

      <SkeletonBloco style={styles.cardListaLargo} />
    </View>
  );
}

// Lista de cards em carregamento
export function SkeletonLista({ quantidade = 3 }) {
  return (
    <View style={styles.lista}>
      {Array.from({ length: quantidade }).map((_, i) => (
        <SkeletonCardLista key={i} />
      ))}
    </View>
  );
}

export default SkeletonBloco;

const styles = StyleSheet.create({
  bloco: {
    backgroundColor: COR_BLOCO,
  },

  tela: {
    flex: 1,
    backgroundColor: '#EAF1FF',
  },

  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    marginBottom: 24,
  },

  cabecalhoBotao: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
  },

  cabecalhoTextos: {
    flex: 1,
  },

  cabecalhoTitulo: {
    width: 190,
    height: 30,
    borderRadius: 10,
  },

  cabecalhoSubtitulo: {
    width: 240,
    maxWidth: '100%',
    height: 16,
    borderRadius: 8,
    marginTop: 10,
  },

  lista: {
    paddingHorizontal: 16,
  },

  cardLista: {
    backgroundColor: '#E3EAF7',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },

  cardListaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  cardListaIcone: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },

  cardListaTextos: {
    flex: 1,
    gap: 10,
  },

  cardListaTitulo: {
    width: '70%',
    height: 22,
    borderRadius: 8,
  },

  cardListaSelo: {
    width: 110,
    height: 24,
    borderRadius: 12,
  },

  cardListaCampos: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  cardListaCampo: {
    flex: 1,
    height: 66,
    borderRadius: 16,
  },

  cardListaLargo: {
    height: 66,
    borderRadius: 16,
    marginTop: 10,
  },
});