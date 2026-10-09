import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function HomeIdoso({ onLogout }) {
  const navigation = useNavigation();
  const { user } = useAuth();

  const nome =
    user?.nome ??
    user?.name ??
    user?.nomeCompleto ??
    '';

  const primeiroNome =
    typeof nome === 'string' && nome.trim()
      ? nome.trim().split(/\s+/)[0]
      : '';

  const cards = [
    {
      titulo: 'Consultas',
      icone: 'calendar-check-outline',
      cor: '#FFE16A',
      rota: 'ConsultasIdoso',
    },
    {
      titulo: 'Saúde',
      icone: 'heart-pulse',
      cor: '#F5B4C5',
      rota: 'HomeIdosoPulseira',
    },
    {
      titulo: 'Medicamentos',
      icone: 'pill',
      cor: '#C8ACE4',
      rota: 'MedicamentosIdoso',
    },
    {
      titulo: 'Doenças',
      icone: 'clipboard-pulse-outline',
      cor: '#F5877E',
      rota: 'DoencasIdoso',
    },
    {
      titulo: 'Notificações',
      icone: 'bell-outline',
      cor: '#A6D8B7',
      rota: 'NotificacoesIdoso',
      largo: true,
    },
  ];

  const sair = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#EAF1FF"
        barStyle="dark-content"
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.saudacaoContainer}>
            <Text style={styles.titulo}>
              Olá{primeiroNome ? `, ${primeiroNome}` : ''}
            </Text>

            <Text style={styles.subtitulo}>
              Como podemos ajudar hoje?
            </Text>
          </View>

          <View style={styles.acoes}>
            <Pressable
              style={styles.botaoHeader}
              accessibilityRole="button"
              accessibilityLabel="Notificações"
              onPress={() => navigation.navigate('NotificacoesIdoso')}
            >
              <MaterialCommunityIcons
                name="bell-outline"
                size={28}
                color="#000000"
              />
            </Pressable>

            <Pressable
              style={styles.botaoHeader}
              accessibilityRole="button"
              accessibilityLabel="Sair"
              onPress={sair}
            >
              <MaterialCommunityIcons
                name="logout"
                size={27}
                color="#000000"
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.menu}>
          {cards.map((card) => (
            <Pressable
              key={card.titulo}
              style={({ pressed }) => [
                styles.card,
                card.largo && styles.cardLargo,
                { backgroundColor: card.cor },
                pressed && styles.cardPressionado,
              ]}
              onPress={() => navigation.navigate(card.rota)}
              accessibilityRole="button"
              accessibilityLabel={card.titulo}
            >
              <MaterialCommunityIcons
                name={card.icone}
                size={card.largo ? 48 : 60}
                color="#000000"
              />

              <Text
                style={[
                  styles.cardTexto,
                  card.largo && styles.cardTextoLargo,
                ]}
              >
                {card.titulo}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EAF1FF',
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  saudacaoContainer: {
    flex: 1,
    marginRight: 10,
  },

  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000000',
  },

  subtitulo: {
    fontSize: 16,
    color: '#333333',
    marginTop: 6,
  },

  acoes: {
    flexDirection: 'row',
    gap: 8,
  },

  botaoHeader: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '48.5%',
    aspectRatio: 0.88,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginBottom: 14,
  },

  cardLargo: {
    width: '100%',
    height: 112,
    aspectRatio: undefined,
    flexDirection: 'row',
    gap: 20,
    borderRadius: 24,
  },

  cardPressionado: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  cardTexto: {
    color: '#000000',
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 18,
  },

  cardTextoLargo: {
    marginTop: 0,
    fontSize: 20,
  },
});