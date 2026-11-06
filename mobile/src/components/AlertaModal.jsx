import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Cores de alto contraste para ícones e botões
export const CORES_ALERTA = {
  verde: '#1B7F3B',
  vermelho: '#B3261E',
  azul: '#1F4FB4',
};

// Alerta no padrão visual do app, no lugar do Alert nativo.
// estilo do botão: 'principal' (verde), 'perigo' (vermelho) ou 'neutro' (branco com borda)
export default function AlertaModal({
  visivel,
  icone = 'information-outline',
  corIcone = CORES_ALERTA.azul,
  titulo,
  mensagem,
  botoes = [],
  aoFechar,
}) {
  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={aoFechar}
    >
      <View style={styles.fundo}>
        <View style={styles.caixa}>
          <View style={[styles.icone, { backgroundColor: corIcone }]}>
            <MaterialCommunityIcons
              name={icone}
              size={40}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.titulo}>{titulo}</Text>

          {mensagem ? (
            <Text style={styles.mensagem}>{mensagem}</Text>
          ) : null}

          {/* Botões empilhados */}
          <View style={styles.botoes}>
            {botoes.map((botao) => (
              <Pressable
                key={botao.texto}
                style={({ pressed }) => [
                  styles.botao,
                  botao.estilo === 'principal' && styles.botaoPrincipal,
                  botao.estilo === 'perigo' && styles.botaoPerigo,
                  (!botao.estilo || botao.estilo === 'neutro') &&
                    styles.botaoNeutro,
                  pressed && styles.botaoPressionado,
                ]}
                accessibilityRole="button"
                accessibilityLabel={botao.texto}
                onPress={botao.onPress}
              >
                <Text
                  style={[
                    styles.botaoTexto,
                    (!botao.estilo || botao.estilo === 'neutro') &&
                      styles.botaoTextoNeutro,
                  ]}
                >
                  {botao.texto}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  caixa: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    alignItems: 'center',
  },

  icone: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titulo: {
    color: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },

  mensagem: {
    color: '#333333',
    fontSize: 18,
    lineHeight: 25,
    textAlign: 'center',
    marginTop: 10,
  },

  botoes: {
    alignSelf: 'stretch',
    gap: 12,
    marginTop: 24,
  },

  botao: {
    minHeight: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  botaoPrincipal: {
    backgroundColor: CORES_ALERTA.verde,
  },

  botaoPerigo: {
    backgroundColor: CORES_ALERTA.vermelho,
  },

  botaoNeutro: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
  },

  botaoPressionado: {
    opacity: 0.75,
  },

  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  botaoTextoNeutro: {
    color: '#000000',
  },
});