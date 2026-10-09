import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import Login from './src/screens/Login/Login';
import HomeIdoso from './src/screens/Idoso/HomeIdoso';
import HomeCuidador from './src/screens/Cuidador/HomeCuidador';
import { lerJwt } from './src/services/storage/auth';
import { logout, aoSessaoExpirar, perfilDoUsuarioLogado } from './src/services/api/api';

export default function App() {
  // null = ainda verificando se já existe token guardado
  const [logado, setLogado] = useState(null);
  // undefined = descobrindo o perfil, null = usuário sem role, 'idoso' | 'cuidador'
  const [perfil, setPerfil] = useState(undefined);
  const [erro, setErro] = useState('');

  // Descobre o perfil em GET /usuario/me (campo role)
  async function carregarPerfil() {
    setErro('');
    setPerfil(undefined);
    try {
      setPerfil(await perfilDoUsuarioLogado());
    } catch (e) {
      setErro(e.message);
    }
  }

  useEffect(() => {
    lerJwt().then((jwt) => {
      setLogado(!!jwt);
      if (jwt) carregarPerfil();
    });
    // token vencido: volta para o login
    aoSessaoExpirar(() => {
      setLogado(false);
      setPerfil(undefined);
      setErro('');
    });
  }, []);

  async function sair() {
    await logout();
    setLogado(false);
    setPerfil(undefined);
    setErro('');
  }

  function aoLogar() {
    setLogado(true);
    carregarPerfil();
  }

  function conteudo() {
    if (logado === null) return <ActivityIndicator style={{ flex: 1 }} />;
    if (!logado) return <Login onLogin={aoLogar} />;

    if (erro || perfil === null) {
      return (
        <View style={styles.centro}>
          <Text style={styles.titulo}>Não foi possível abrir</Text>
          <Text style={styles.texto}>
            {erro || 'Seu usuário ainda não tem um perfil (idoso ou cuidador). Peça ajuda a quem fez o seu cadastro.'}
          </Text>
          <Pressable style={styles.botao} onPress={sair} accessibilityRole="button">
            <Text style={styles.botaoTexto}>Sair da conta</Text>
          </Pressable>
        </View>
      );
    }

    if (perfil === undefined) return <ActivityIndicator style={{ flex: 1 }} />;
    if (perfil === 'cuidador') return <HomeCuidador onSair={sair} />;
    return <HomeIdoso onSair={sair} />;
  }

  return (
    <View style={{ flex: 1, paddingTop: StatusBar.currentHeight ?? 44, backgroundColor: '#E1F5FE' }}>
      <StatusBar />
      {conteudo()}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  titulo: { fontSize: 32, fontWeight: 'bold', color: '#000000' },
  texto: { fontSize: 20, color: '#333333' },
  botao: {
    minHeight: 72,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: { fontSize: 22, fontWeight: 'bold', color: '#000000' },
});