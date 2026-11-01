import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CORES_ALERTA } from './AlertaModal';
import { useTema } from '../contexts/TemaContext';

// Formulário em Modal, no mesmo estilo do AlertaModal.
//
// campos: [{
//   chave, rotulo, placeholder, multiline, teclado, maxLength,
//   somenteEditar,   // só aparece quando "editando" é true (ex.: status)
//   Componente,      // ({ valor, aoMudar, cor, form }) => JSX
//                     // quando presente, substitui o TextInput padrão
//                     // (usado para chips, contador, etc. — campo clicável,
//                     // sem teclado)
// }]
// valores: { [chave]: texto }   erros: { [chave]: mensagem }
// editando: true quando é edição de um item já existente (false = criação)
export default function FormularioModal({
  visivel,
  icone = 'pencil-outline',
  corIcone = CORES_ALERTA.azul,
  titulo,
  campos = [],
  valores = {},
  erros = {},
  salvando = false,
  editando = false,
  textoConfirmar = 'Salvar',
  textoCancelar = 'Cancelar',
  aoMudar,
  aoConfirmar,
  aoCancelar,
}) {
  const { cores } = useTema();
  const styles = useMemo(() => criarStyles(cores), [cores]);

  // Campos "somenteEditar" (ex.: status) só entram na lista quando está editando
  const camposVisiveis = campos.filter(
    (campo) => !campo.somenteEditar || editando,
  );

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={salvando ? undefined : aoCancelar}
    >
      <KeyboardAvoidingView
        style={styles.fundoModal}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.caixaModal}>
          <View style={styles.topo}>
            <View style={[styles.iconeCirculo, { backgroundColor: corIcone }]}>
              <MaterialCommunityIcons name={icone} size={30} color="#FFFFFF" />
            </View>

            <Text style={styles.titulo} numberOfLines={2}>
              {titulo}
            </Text>
          </View>

          <ScrollView
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {camposVisiveis.map((campo) => {
              const erro = erros[campo.chave];

              return (
                <View key={campo.chave} style={styles.campo}>
                  <Text style={styles.rotulo}>{campo.rotulo}</Text>

                  {campo.Componente ? (
                    // Campo clicável (chips, contador, etc.) em vez de digitar.
                    // Recebe o form inteiro em "form" para poder reagir a
                    // outros campos já preenchidos (ex.: valorFrequencia
                    // olhando o tipoFrequencia escolhido).
                    campo.Componente({
                      valor: valores[campo.chave],
                      aoMudar: (novoValor) => aoMudar(campo.chave, novoValor),
                      cor: corIcone,
                      form: valores,
                    })
                  ) : (
                    <TextInput
                      style={[
                        styles.input,
                        campo.multiline && styles.inputMultilinha,
                        erro && styles.inputErro,
                      ]}
                      value={valores[campo.chave] ?? ''}
                      onChangeText={(texto) => aoMudar(campo.chave, texto)}
                      placeholder={campo.placeholder}
                      placeholderTextColor={cores.textoSecundario}
                      keyboardType={campo.teclado ?? 'default'}
                      maxLength={campo.maxLength}
                      multiline={!!campo.multiline}
                      editable={!salvando}
                      accessibilityLabel={campo.rotulo}
                    />
                  )}

                  {erro ? <Text style={styles.erro}>{erro}</Text> : null}
                </View>
              );
            })}
          </ScrollView>

          <Pressable
            style={({ pressed }) => [
              styles.botao,
              styles.botaoConfirmar,
              (pressed || salvando) && styles.botaoPressionado,
            ]}
            accessibilityRole="button"
            accessibilityLabel={textoConfirmar}
            disabled={salvando}
            onPress={aoConfirmar}
          >
            {salvando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.botaoConfirmarTexto}>{textoConfirmar}</Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.botao,
              styles.botaoCancelar,
              pressed && styles.botaoPressionado,
            ]}
            accessibilityRole="button"
            accessibilityLabel={textoCancelar}
            disabled={salvando}
            onPress={aoCancelar}
          >
            <Text style={styles.botaoCancelarTexto}>{textoCancelar}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const criarStyles = (cores) =>
  StyleSheet.create({
    fundoModal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },

    caixaModal: {
      width: '100%',
      maxWidth: 420,
      maxHeight: '90%',
      backgroundColor: cores.superficie,
      borderRadius: 28,
      paddingHorizontal: 22,
      paddingTop: 22,
      paddingBottom: 22,
    },

    topo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      marginBottom: 20,
    },

    iconeCirculo: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },

    titulo: {
      flex: 1,
      flexShrink: 1,
      color: cores.texto,
      fontSize: 24,
      fontWeight: 'bold',
    },

    scroll: {
      flexGrow: 0,
      flexShrink: 1,
    },

    campo: {
      marginBottom: 14,
    },

    rotulo: {
      color: cores.texto,
      fontSize: 17,
      fontWeight: 'bold',
      marginBottom: 6,
    },

    input: {
      minHeight: 54,
      borderWidth: 2,
      borderColor: cores.borda,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 10,
      color: cores.texto,
      fontSize: 19,
    },

    inputMultilinha: {
      minHeight: 96,
      textAlignVertical: 'top',
    },

    inputErro: {
      borderColor: CORES_ALERTA.vermelho,
    },

    erro: {
      color: CORES_ALERTA.vermelho,
      fontSize: 15,
      marginTop: 4,
    },

    botao: {
      minHeight: 58,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },

    botaoPressionado: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },

    botaoConfirmar: {
      backgroundColor: CORES_ALERTA.azul,
      marginTop: 8,
    },

    botaoConfirmarTexto: {
      color: '#FFFFFF',
      fontSize: 19,
      fontWeight: 'bold',
    },

    botaoCancelar: {
      backgroundColor: cores.botaoHeader,
    },

    botaoCancelarTexto: {
      color: cores.texto,
      fontSize: 19,
      fontWeight: 'bold',
    },
  });