import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { login } from '../../services/api/api';
import { API_URL } from '../../services/api/config';

// Props: onLogin() é chamado depois que o token foi guardado
export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function entrar() {
    if (carregando) return;
    if (!email.trim() || !senha) {
      setErro('Preencha o e-mail e a senha');
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      await login(email.trim(), senha); // busca na API e guarda o token
      onLogin();
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.titulo}>Entrar</Text>

      {/* TEMPORÁRIO: mostra qual API o app está usando. Apague depois de resolver. */}
      <Text style={{ textAlign: 'center', color: '#888' }}>API: {API_URL}</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!carregando}
      />

      <TextInput
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
        placeholder="Senha"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!carregando}
        onSubmitEditing={entrar}
      />

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <Pressable
        style={[styles.botao, carregando && styles.botaoDesabilitado]}
        onPress={entrar}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botaoTexto}>Entrar</Text>
        )}
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },

  erro: {
    color: '#b00020',
    fontSize: 14,
  },

  botao: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});