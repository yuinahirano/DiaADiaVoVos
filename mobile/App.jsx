import React from 'react';
import { StatusBar, View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Públicas
import Login from './src/screens/Login/Login';
import Cadastro from './src/screens/cadastro/cadastro';

// Cuidador
import HomeCuidador from './src/screens/cuidador/HomeCuidador';
import PulseiraCuidador from './src/screens/cuidador/PulseiraCuidador';

// Idoso
import HomeIdoso from './src/screens/idoso/HomeIdoso';
import PulseiraIdoso from './src/screens/idoso/PulseiraIdoso';

// TEMPORÁRIO: enquanto o Login não leva ao cadastro, abre direto na tela de Cadastro.
// Quando for ligar o Login, troque para false (ou apague esta constante).
const ABRIR_CADASTRO_PRIMEIRO = true;

const Stack = createNativeStackNavigator();


function TelaLogin({ navigation }) {
  const { aoLogar } = useAuth();
  return <Login onLogin={aoLogar} onCadastro={() => navigation.navigate('Cadastro')} />;
}

function TelaCadastro({ navigation }) {
  // Chamado pelo Cadastro depois que a API criou o usuário
  return (
    <Cadastro
      onCadastro={(dados) => navigation.navigate('ProximaEtapa', { nome: dados?.nome })}
    />
  );
}

function TelaProximaEtapa({ navigation, route }) {
  const nome = route.params?.nome;
  return (
    <View style={styles.centro}>
      <Text style={styles.titulo}>Conta criada!</Text>
      <Text style={styles.texto}>
        {nome ? `${nome}, ` : ''}a próxima etapa do cadastro entra aqui.
      </Text>
      <Pressable
        style={styles.botao}
        onPress={() => navigation.navigate('Login')}
        accessibilityRole="button"
      >
        <Text style={styles.botaoTexto}>Ir para o login</Text>
      </Pressable>
    </View>
  );
}


function TelaSemPerfil() {
  const { erro, sair } = useAuth();
  return (
    <View style={styles.centro}>
      <Text style={styles.titulo}>Não foi possível abrir</Text>
      <Text style={styles.texto}>
        {erro ||
          'Seu usuário ainda não tem um perfil (idoso ou cuidador). Peça ajuda a quem fez o seu cadastro.'}
      </Text>
      <Pressable style={styles.botao} onPress={sair} accessibilityRole="button">
        <Text style={styles.botaoTexto}>Sair da conta</Text>
      </Pressable>
    </View>
  );
}


function TelaHomeCuidador(props) {
  const { sair } = useAuth();
  return <HomeCuidador {...props} onSair={sair} />;
}

function TelaHomeIdoso(props) {
  const { sair } = useAuth();
  return <HomeIdoso {...props} onSair={sair} />;
}


function Rotas() {
  const { carregando, logado, perfil, erro } = useAuth();

  if (carregando) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#E1F5FE' } }}
      initialRouteName={!logado && ABRIR_CADASTRO_PRIMEIRO ? 'Cadastro' : undefined}
    >
      {!logado ? (
        // NÃO LOGADO
        <>
          <Stack.Screen name="Login" component={TelaLogin} />
          <Stack.Screen name="Cadastro" component={TelaCadastro} />
          <Stack.Screen name="ProximaEtapa" component={TelaProximaEtapa} />
        </>
      ) : erro || perfil === null ? (
        // LOGADO, MAS SEM PERFIL OU COM ERRO AO BUSCAR
        <Stack.Screen name="SemPerfil" component={TelaSemPerfil} />
      ) : perfil === 'cuidador' ? (
        // CUIDADOR
        <>
          <Stack.Screen name="HomeCuidador" component={TelaHomeCuidador} />
          <Stack.Screen name="PulseiraCuidador" component={PulseiraCuidador} />
          {/* TODO: demais telas do cuidador */}
        </>
      ) : (
        // IDOSO
        <>
          <Stack.Screen name="HomeIdoso" component={TelaHomeIdoso} />
          <Stack.Screen name="PulseiraIdoso" component={PulseiraIdoso} />
          {/* TODO: demais telas do idoso */}
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <View style={{ flex: 1, paddingTop: StatusBar.currentHeight ?? 44, backgroundColor: '#E1F5FE' }}>
        <StatusBar />
        <NavigationContainer>
          <Rotas />
        </NavigationContainer>
      </View>
    </AuthProvider>
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