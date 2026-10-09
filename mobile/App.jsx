import React from 'react';
import { StatusBar, View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Públicas
import Login from './src/screens/Login/Login';
import Cadastro from './src/screens/Cadastro/Cadastro';

// Escolha de perfil (logado, mas sem idoso/cuidador)
import { EscolherPerfil, DadosIdoso, DadosCuidador } from './src/screens/Cadastro/EtapaPerfil';

// Cuidador
import HomeCuidador from './src/screens/Cuidador/HomeCuidador';
import PulseiraCuidador from './src/screens/Cuidador/PulseiraCuidador';

// Idoso
import HomeIdoso from './src/screens/Idoso/HomeIdoso';
import PulseiraIdoso from './src/screens/Idoso/PulseiraIdoso';

const Stack = createNativeStackNavigator();

function TelaLogin({ navigation }) {
  const { aoLogar } = useAuth();

  return (
    <Login
      onLogin={aoLogar}
      onCadastro={() => navigation.navigate('Cadastro')}
    />
  );
}

function TelaCadastro({ navigation }) {
  // Chamado pelo Cadastro depois que a API criou o usuário
  return (
    <Cadastro
      onCadastro={(dados) =>
        navigation.navigate('ProximaEtapa', { nome: dados?.nome })
      }
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

// Logado, mas o usuário ainda não é idoso nem cuidador
function TelaEscolherPerfil({ navigation }) {
  const { sair } = useAuth();

  return (
    <EscolherPerfil
      onSair={sair}
      onEscolher={(tipo) =>
        navigation.navigate(
          tipo === 'cuidador' ? 'DadosCuidador' : 'DadosIdoso'
        )
      }
    />
  );
}

function TelaDadosIdoso({ navigation }) {
  // Depois do cadastro, busca o perfil de novo: o Rotas troca sozinho para a Home
  const { recarregarPerfil } = useAuth();

  return (
    <DadosIdoso
      onConcluido={recarregarPerfil}
      onVoltar={() => navigation.goBack()}
    />
  );
}

function TelaDadosCuidador({ navigation }) {
  const { recarregarPerfil } = useAuth();

  return (
    <DadosCuidador
      onConcluido={recarregarPerfil}
      onVoltar={() => navigation.goBack()}
    />
  );
}

function TelaSemPerfil() {
  const { erro, sair } = useAuth();

  return (
    <View style={styles.centro}>
      <Text style={styles.titulo}>Não foi possível abrir</Text>

      <Text style={styles.texto}>
        {erro ||
          'Não foi possível carregar o seu perfil. Tente entrar novamente.'}
      </Text>

      <Pressable
        style={styles.botao}
        onPress={sair}
        accessibilityRole="button"
      >
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

  if (carregando) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#E1F5FE' },
      }}
      initialRouteName={
        !logado
          ? 'Login'
          : erro
            ? 'SemPerfil'
            : perfil === null
              ? 'EscolherPerfil'
              : perfil === 'cuidador'
                ? 'HomeCuidador'
                : 'HomeIdoso'
      }
    >
      {!logado ? (
        // NÃO LOGADO
        <>
          <Stack.Screen name="Login" component={TelaLogin} />
          <Stack.Screen name="Cadastro" component={TelaCadastro} />
          <Stack.Screen name="ProximaEtapa" component={TelaProximaEtapa} />
        </>
      ) : erro ? (
        // LOGADO, MAS DEU ERRO AO BUSCAR O PERFIL
        <Stack.Screen name="SemPerfil" component={TelaSemPerfil} />
      ) : perfil === null ? (
        // LOGADO, MAS AINDA NÃO É IDOSO NEM CUIDADOR: escolha obrigatória
        <>
          <Stack.Screen
            name="EscolherPerfil"
            component={TelaEscolherPerfil}
          />
          <Stack.Screen name="DadosIdoso" component={TelaDadosIdoso} />
          <Stack.Screen name="DadosCuidador" component={TelaDadosCuidador} />
        </>
      ) : perfil === 'cuidador' ? (
        // CUIDADOR
        <>
          <Stack.Screen name="HomeCuidador" component={TelaHomeCuidador} />
          <Stack.Screen
            name="PulseiraCuidador"
            component={PulseiraCuidador}
          />
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
      <View
        style={{
          flex: 1,
          paddingTop: StatusBar.currentHeight ?? 44,
          backgroundColor: '#E1F5FE',
        }}
      >
        <StatusBar />
        <NavigationContainer>
          <Rotas />
        </NavigationContainer>
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  texto: {
    fontSize: 20,
    color: '#333333',
  },
  botao: {
    minHeight: 72,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
});