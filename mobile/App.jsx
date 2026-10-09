import React from 'react';
import {
  StatusBar,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Telas públicas
import Login from './src/screens/Login/Login';
import Cadastro from './src/screens/Cadastro/Cadastro';

// Cadastro de perfil
import {
  EscolherPerfil,
  DadosIdoso,
  DadosCuidador,
} from './src/screens/Cadastro/EtapaPerfil';

// Pulseiras
import PulseiraCuidador from './src/screens/Cuidador/PulseiraCuidador';
import PulseiraIdoso from './src/screens/Idoso/PulseiraIdoso';

// Telas do idoso
import HomeIdoso from './src/screens/Idoso/HomeIdoso';
import HomeIdosoPulseira from './src/screens/Idoso/HomeIdosoPulseira';

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

// Os dois perfis utilizam a nova tela inicial
function TelaHomePrincipal(props) {
  const { sair } = useAuth();

  return <HomeIdoso {...props} onLogout={sair} />;
}

// Tela Saúde: HomeIdosoPulseira
function TelaHomeIdosoPulseira(props) {
  const { sair } = useAuth();

  return <HomeIdosoPulseira {...props} onSair={sair} />;
}

// Telas provisórias para os atalhos da home
function TelaDestinoIdoso({ navigation, route }) {
  const titulos = {
    ConsultasIdoso: 'Consultas',
    MedicamentosIdoso: 'Medicamentos',
    DoencasIdoso: 'Doenças',
    NotificacoesIdoso: 'Notificações',
  };

  return (
    <View style={styles.centro}>
      <Text style={styles.titulo}>
        {titulos[route.name] || 'Página'}
      </Text>

      <Text style={styles.texto}>
        Esta tela será implementada posteriormente.
      </Text>

      <Pressable
        style={styles.botao}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
      >
        <Text style={styles.botaoTexto}>Voltar para a home</Text>
      </Pressable>
    </View>
  );
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
        contentStyle: { backgroundColor: '#EAF1FF' },
      }}
      initialRouteName={
        !logado
          ? 'Login'
          : erro
            ? 'SemPerfil'
            : perfil === null
              ? 'EscolherPerfil'
              : 'HomePrincipal'
      }
    >
      {!logado ? (
        <>
          <Stack.Screen name="Login" component={TelaLogin} />
          <Stack.Screen name="Cadastro" component={TelaCadastro} />
          <Stack.Screen
            name="ProximaEtapa"
            component={TelaProximaEtapa}
          />
        </>
      ) : erro ? (
        <Stack.Screen name="SemPerfil" component={TelaSemPerfil} />
      ) : perfil === null ? (
        <>
          <Stack.Screen
            name="EscolherPerfil"
            component={TelaEscolherPerfil}
          />
          <Stack.Screen name="DadosIdoso" component={TelaDadosIdoso} />
          <Stack.Screen
            name="DadosCuidador"
            component={TelaDadosCuidador}
          />
        </>
      ) : perfil === 'cuidador' ? (
        <>
          <Stack.Screen
            name="HomePrincipal"
            component={TelaHomePrincipal}
          />
          <Stack.Screen
            name="HomeIdosoPulseira"
            component={TelaHomeIdosoPulseira}
          />
          <Stack.Screen
            name="PulseiraCuidador"
            component={PulseiraCuidador}
          />
          <Stack.Screen
            name="ConsultasIdoso"
            component={TelaDestinoIdoso}
          />
          <Stack.Screen
            name="MedicamentosIdoso"
            component={TelaDestinoIdoso}
          />
          <Stack.Screen
            name="DoencasIdoso"
            component={TelaDestinoIdoso}
          />
          <Stack.Screen
            name="NotificacoesIdoso"
            component={TelaDestinoIdoso}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="HomePrincipal"
            component={TelaHomePrincipal}
          />
          <Stack.Screen
            name="HomeIdosoPulseira"
            component={TelaHomeIdosoPulseira}
          />
          <Stack.Screen
            name="PulseiraIdoso"
            component={PulseiraIdoso}
          />
          <Stack.Screen
            name="ConsultasIdoso"
            component={TelaDestinoIdoso}
          />
          <Stack.Screen
            name="MedicamentosIdoso"
            component={TelaDestinoIdoso}
          />
          <Stack.Screen
            name="DoencasIdoso"
            component={TelaDestinoIdoso}
          />
          <Stack.Screen
            name="NotificacoesIdoso"
            component={TelaDestinoIdoso}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <View style={styles.app}>
        <StatusBar
          backgroundColor="#EAF1FF"
          barStyle="dark-content"
        />
        <NavigationContainer>
          <Rotas />
        </NavigationContainer>
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    paddingTop: StatusBar.currentHeight ?? 0,
    backgroundColor: '#EAF1FF',
  },
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
    minHeight: 64,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
});