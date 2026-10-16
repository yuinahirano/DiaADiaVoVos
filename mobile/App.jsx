import React from 'react';
import {
  StatusBar,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { TemaProvider, useTema } from './src/contexts/TemaContext';
import { IdosoSelecionadoProvider } from './src/contexts/IdosoSelecionadoContext';

// Telas públicas
import Login from './src/screens/Login/Login';
import Cadastro from './src/screens/cadastro/cadastro';

// Cadastro de perfil
import {
  EscolherPerfil,
  DadosIdoso,
  DadosCuidador,
} from './src/screens/cadastro/EtapaPerfil';

// Pulseiras
import PulseiraCuidador from './src/screens/Cuidador/PulseiraCuidador';
import PulseiraIdoso from './src/screens/Idoso/PulseiraIdoso';

// Telas do cuidador
import HomeCuidador from './src/screens/Cuidador/HomeCuidador';
import DetalhesIdoso from './src/screens/Cuidador/DetalhesIdoso';
import ListaIdoso from './src/screens/Cuidador/ListaIdoso';
import PerfilIdoso from './src/screens/Cuidador/Lista/PerfilIdoso';

// Telas do idoso
import HomeIdoso from './src/screens/Idoso/HomeIdoso';
import HomeIdosoPulseira from './src/screens/Idoso/HomeIdosoPulseira';
import DoencasIdoso from './src/screens/Idoso/DoencasIdoso';
import MedicamentosIdoso from './src/screens/Idoso/MedicamentosIdoso';
import ConsultasIdoso from './src/screens/Idoso/ConsultasIdoso';
import NotificacoesIdoso from './src/screens/Idoso/NotificacoesIdoso';
import MeusDados from './src/screens/Idoso/DadosIdoso';

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

// Home do idoso
function TelaHomePrincipal(props) {
  const { sair } = useAuth();

  return <HomeIdoso {...props} onLogout={sair} />;
}

// Home do cuidador (lista de idosos vinculados + configurações)
function TelaHomeCuidador(props) {
  const { sair } = useAuth();

  return <HomeCuidador {...props} onLogout={sair} />;
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

// Tela mostrada enquanto o app carrega a sessão: logo + indicador
function TelaCarregando() {
  return (
    <View style={styles.carregando}>
      <Image
        source={require('./assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Logo do aplicativo"
      />

      <ActivityIndicator size="large" color="#000000" />
    </View>
  );
}

// "fundo" vem da Raiz: tema escolhido para o cuidador, azul claro para o resto
function Rotas({ fundo }) {
  const { carregando, logado, perfil, erro } = useAuth();

  if (carregando) {
    return <TelaCarregando />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: fundo },
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
          {/* O próprio Cadastro leva direto para o Login depois de criar a conta */}
          <Stack.Screen name="Cadastro" component={Cadastro} />
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
            component={TelaHomeCuidador}
          />
          <Stack.Screen
            name="DetalhesIdoso"
            component={DetalhesIdoso}
          />
          <Stack.Screen
            name="ListaIdoso"
            component={ListaIdoso}
          />
          <Stack.Screen
            name="PerfilIdoso"
            component={PerfilIdoso}
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
            component={ConsultasIdoso}
          />
          <Stack.Screen
            name="MedicamentosIdoso"
            component={MedicamentosIdoso}
          />
          {/* Somente idosos acessam a tela de doenças */}
          <Stack.Screen
            name="DoencasIdoso"
            component={DoencasIdoso}
          />
          <Stack.Screen
            name="NotificacoesIdoso"
            component={NotificacoesIdoso}
          />
          {/* Dados pessoais do próprio idoso (só visualização) */}
          <Stack.Screen
            name="MeusDados"
            component={MeusDados}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

// Decide as cores do app: só o cuidador usa o tema claro/escuro
function Raiz() {
  const { perfil } = useAuth();
  const { cores } = useTema();

  const usaTema = perfil === 'cuidador';
  const fundo = usaTema ? cores.fundo : '#EAF1FF';
  const barStyle = usaTema ? cores.statusBar : 'dark-content';

  return (
    <View
      style={[
        styles.app,
        { paddingTop: StatusBar.currentHeight ?? 0, backgroundColor: fundo },
      ]}
    >
      <StatusBar backgroundColor={fundo} barStyle={barStyle} />
      <NavigationContainer>
        <Rotas fundo={fundo} />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TemaProvider>
        <IdosoSelecionadoProvider>
          <Raiz />
        </IdosoSelecionadoProvider>
      </TemaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
  carregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    backgroundColor: '#EAF1FF',
  },
  logo: {
    width: 200,
    height: 200,
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