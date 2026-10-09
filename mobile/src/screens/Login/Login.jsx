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
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
} from '@expo-google-fonts/open-sans';

import { login } from '../../services/api/api';
// import { API_URL } from '../../services/api/config'; // debug temporário

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// TEMPORÁRIO: o backend hoje responde 500 quando as credenciais não batem.
// Quando ele passar a responder 401, remova o 500 desta lista.
const STATUS_CREDENCIAL_INVALIDA = [400, 401, 403, 404, 500];

function traduzirErro(e) {
  const msg = e?.message || '';
  const status = e?.status ?? Number(msg.match(/API respondeu (\d{3})/)?.[1]);

  if (msg.includes('Sem conexão')) {
    return 'Sem conexão com o servidor. Verifique sua internet.';
  }
  if (STATUS_CREDENCIAL_INVALIDA.includes(status)) {
    return 'E-mail ou senha inválidos.';
  }
  if (status >= 500) {
    return 'Erro no servidor. Tente novamente em instantes.';
  }
  return 'Não foi possível entrar. Tente novamente.';
}

// Props:
//  onLogin()         -> chamado depois que o token foi guardado
//  onCriarUsuario()  -> opcional, chamado ao tocar em "Criar um novo usuário."
export default function Login({ onLogin, onCriarUsuario }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const [fontsLoaded] = useFonts({ OpenSans_600SemiBold, OpenSans_700Bold });

  async function entrar() {
    if (carregando) return;

    if (!email.trim() || !senha) {
      setErro('Preencha o e-mail e a senha.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setErro('Digite um e-mail válido (ex: nome@email.com).');
      return;
    }

    setErro('');
    setCarregando(true);
    try {
      await login(email.trim(), senha); // busca na API e guarda o token
      onLogin();
    } catch (e) {
      setErro(traduzirErro(e));
    } finally {
      setCarregando(false);
    }
  }

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Logo: coloque a imagem em mobile/assets/logo.png */}
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* E-mail */}
          <View style={styles.linha}>
            <Ionicons name="person" size={30} color="#000" style={styles.icone} />
            <TextInput
              style={[styles.input, !!erro && styles.inputErro]}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setErro('');
              }}
              placeholder="Seu e-mail"
              placeholderTextColor="#8A97A3"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!carregando}
            />
          </View>

          {/* Senha */}
          <View style={styles.linha}>
            <Ionicons name="lock-closed" size={30} color="#000" style={styles.icone} />
            <View style={styles.inputSenhaWrapper}>
              <TextInput
                style={[styles.input, styles.inputSenha, !!erro && styles.inputErro]}
                value={senha}
                onChangeText={(t) => {
                  setSenha(t);
                  setErro('');
                }}
                placeholder="Sua senha"
                placeholderTextColor="#8A97A3"
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!carregando}
                onSubmitEditing={entrar}
              />
              <Pressable
                style={styles.olho}
                onPress={() => setMostrarSenha((v) => !v)}
                hitSlop={10}
              >
                <Ionicons
                  name={mostrarSenha ? 'eye' : 'eye-off'}
                  size={24}
                  color="#000"
                />
              </Pressable>
            </View>
          </View>

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}

          {/* Botão */}
          <Pressable
            style={({ pressed }) => [
              styles.botao,
              (carregando || pressed) && styles.botaoDesabilitado,
            ]}
            onPress={entrar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.botaoTexto}>Entrar</Text>
            )}
          </Pressable>

          {/* Link */}
          <Pressable onPress={() => onCriarUsuario?.()} hitSlop={8}>
            <Text style={styles.link}>Criar um novo usuário.</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F1FF',
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },

  logo: {
    width: 110,
    height: 90,
    marginBottom: 28,
  },

  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },

  icone: {
    width: 36,
    marginRight: 6,
    textAlign: 'center',
  },

  input: {
    flex: 1,
    height: 42,
    backgroundColor: '#E3ECF1',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 21,
    paddingHorizontal: 12,
    fontSize: 13,
    fontFamily: 'OpenSans_600SemiBold',
    color: '#000',
  },

  inputErro: {
    borderColor: '#B00020',
  },

  inputSenhaWrapper: {
    flex: 1,
    justifyContent: 'center',
  },

  inputSenha: {
    paddingRight: 46,
  },

  olho: {
    position: 'absolute',
    right: 14,
    height: '100%',
    justifyContent: 'center',
  },

  erro: {
    color: '#B00020',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'OpenSans_600SemiBold',
  },

  botao: {
    backgroundColor: '#FFE566',
    height: 46,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 32,
  },

  botaoDesabilitado: {
    opacity: 0.7,
  },

  botaoTexto: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
  },

  link: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    textDecorationLine: 'underline',
  },
});