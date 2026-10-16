import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AlertaModal, { CORES_ALERTA } from '../../components/AlertaModal';
import { SkeletonBloco, SkeletonTela } from '../../components/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import { listarAvisosDoIdoso } from '../../services/api/apiIdoso';
import {
  consultasProximas,
  formatarHorario,
  nivelDaConsulta,
} from '../../utils/avisosIdoso';

// Card "Meus dados": azul-turquesa claro, o mesmo do card "Dados do idoso" do cuidador
const COR_PERFIL = '#8FD9E8';

// Esqueleto da Home: mesma estrutura da tela real, para nada "pular" depois
function HomeSkeleton() {
  return (
    <SkeletonTela rotulo="Carregando sua tela inicial">
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        <View style={styles.header}>
          <View style={styles.saudacaoContainer}>
            <SkeletonBloco style={styles.skTitulo} />
            <SkeletonBloco style={styles.skSubtitulo} />
          </View>

          <View style={styles.acoes}>
            <SkeletonBloco style={styles.skBotaoHeader} />
            <SkeletonBloco style={styles.skBotaoHeader} />
          </View>
        </View>

        <View style={styles.menu}>
          <SkeletonBloco style={styles.card} />
          <SkeletonBloco style={styles.card} />
          <SkeletonBloco style={styles.card} />
          <SkeletonBloco style={styles.card} />
          <SkeletonBloco style={[styles.card, styles.cardLargo]} />
          <SkeletonBloco style={[styles.card, styles.cardLargo]} />
        </View>
      </ScrollView>
    </SkeletonTela>
  );
}

export default function HomeIdoso({ onLogout }) {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [agora, setAgora] = useState(Date.now());
  // Esqueleto: só no primeiro carregamento (depois atualiza em silêncio)
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  // X do resumo: só esconde até a próxima vez que a tela ganhar foco
  const [resumoFechado, setResumoFechado] = useState(false);
  // Modal de confirmação de saída
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  // Toda vez que a Home ganha foco: recarrega e reabre o resumo se houver aviso
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      setResumoFechado(false);

      (async () => {
        try {
          const avisos = await listarAvisosDoIdoso();

          if (ativo) {
            setSolicitacoes(avisos.solicitacoes);
            setConsultas(avisos.consultas);
            setAgora(Date.now());
          }
        } catch (e) {
          // Falha silenciosa: a Home continua funcionando sem o sinal
          if (ativo) {
            setSolicitacoes([]);
            setConsultas([]);
          }
        } finally {
          if (ativo) {
            setCarregandoInicial(false);
          }
        }
      })();

      return () => {
        ativo = false;
      };
    }, []),
  );

  const nome = user?.nome ?? user?.name ?? user?.nomeCompleto ?? '';

  const primeiroNome =
    typeof nome === 'string' && nome.trim()
      ? nome.trim().split(/\s+/)[0]
      : '';

  const avisosConsulta = useMemo(
    () => consultasProximas(consultas, agora),
    [consultas, agora],
  );

  // Separa por dia: 0 = hoje, 1 = amanhã, 2 = depois de amanhã
  const deHoje = avisosConsulta.filter((c) => c.dias === 0);
  const deAmanha = avisosConsulta.filter((c) => c.dias === 1);
  const deDepois = avisosConsulta.filter((c) => c.dias === 2);

  const qtdPedidos = solicitacoes.length;
  const total = qtdPedidos + avisosConsulta.length;
  const temPendencia = total > 0;
  const mostrarResumo = temPendencia && !resumoFechado;

  // Cor do card: a da consulta mais próxima; sem consulta, o verde de sempre
  const proxima = avisosConsulta[0];
  const corNotif = proxima ? nivelDaConsulta(proxima, agora).cor : '#A6D8B7';

  const seloTextoTotal = total > 9 ? '9+' : String(total);
  const descricaoTotal = `${total} aviso${total > 1 ? 's' : ''} para você`;

  // Se tem consulta amanhã, o subtítulo do card fala disso
  const subtituloCard =
    deAmanha.length > 0
      ? `Amanhã: ${deAmanha.length} consulta${deAmanha.length > 1 ? 's' : ''}`
      : descricaoTotal;

  const hojeVisiveis = deHoje.slice(0, 2);
  const amanhaVisiveis = deAmanha.slice(0, 2);
  const maisHoje = deHoje.length - hojeVisiveis.length;
  const maisAmanha = deAmanha.length - amanhaVisiveis.length;

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
  ];

  // Sai de verdade (só roda depois de confirmar no modal)
  const sair = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigation.navigate('Login');
    }
  };

  const pedirSaida = () => setConfirmandoSaida(true);
  const cancelarSaida = () => setConfirmandoSaida(false);

  const confirmarSaida = () => {
    setConfirmandoSaida(false);
    sair();
  };

  const irParaNotificacoes = () => navigation.navigate('NotificacoesIdoso');

  // Primeiro carregamento: mostra o esqueleto
  if (carregandoInicial) {
    return <HomeSkeleton />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#EAF1FF" barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.saudacaoContainer}>
            <Text style={styles.titulo}>
              Olá{primeiroNome ? `, ${primeiroNome}` : ''}
            </Text>

            <Text style={styles.subtitulo}>Como podemos ajudar hoje?</Text>
          </View>

          <View style={styles.acoes}>
            <Pressable
              style={styles.botaoHeader}
              accessibilityRole="button"
              accessibilityLabel={
                temPendencia
                  ? `Notificações, ${total} aviso${total > 1 ? 's' : ''}`
                  : 'Notificações'
              }
              onPress={irParaNotificacoes}
            >
              <MaterialCommunityIcons
                name={temPendencia ? 'bell-ring-outline' : 'bell-outline'}
                size={28}
                color="#000000"
              />

              {temPendencia ? (
                <View style={styles.selo}>
                  <Text style={styles.seloTexto}>{seloTextoTotal}</Text>
                </View>
              ) : null}
            </Pressable>

            <Pressable
              style={styles.botaoHeader}
              accessibilityRole="button"
              accessibilityLabel="Sair"
              onPress={pedirSaida}
            >
              <MaterialCommunityIcons name="logout" size={27} color="#000000" />
            </Pressable>
          </View>
        </View>

        <View style={styles.menu}>
          {cards.map((card) => (
            <Pressable
              key={card.titulo}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: card.cor },
                pressed && styles.cardPressionado,
              ]}
              onPress={() => navigation.navigate(card.rota)}
              accessibilityRole="button"
              accessibilityLabel={card.titulo}
            >
              <MaterialCommunityIcons
                name={card.icone}
                size={60}
                color="#000000"
              />

              <Text style={styles.cardTexto}>{card.titulo}</Text>
            </Pressable>
          ))}

          {/* Meus dados: card largo, abre a tela de dados pessoais (só visualização) */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              styles.cardLargo,
              { backgroundColor: COR_PERFIL },
              pressed && styles.cardPressionado,
            ]}
            onPress={() => navigation.navigate('MeusDados')}
            accessibilityRole="button"
            accessibilityLabel="Meus dados, dados pessoais"
          >
            <MaterialCommunityIcons
              name="account-details-outline"
              size={48}
              color="#000000"
            />

            <View style={styles.textosLargo}>
              <Text style={[styles.cardTexto, styles.cardTextoLargo]}>
                Meus dados
              </Text>

              <Text style={styles.cardSubtexto}>Dados pessoais</Text>
            </View>
          </Pressable>

          {/* Card de notificações: normal ou expandido com resumo */}
          {mostrarResumo ? (
            <Pressable
              style={({ pressed }) => [
                styles.cardNotif,
                { backgroundColor: corNotif },
                pressed && styles.cardPressionado,
              ]}
              onPress={irParaNotificacoes}
              accessibilityRole="button"
              accessibilityLabel={`Notificações, ${subtituloCard}`}
            >
              <View style={styles.cardNotifTopo}>
                <View style={styles.cardNotifIcone}>
                  <MaterialCommunityIcons
                    name="bell-ring-outline"
                    size={32}
                    color="#000000"
                  />
                </View>

                <View style={styles.cardNotifTituloContainer}>
                  <Text style={styles.cardNotifTitulo}>Notificações</Text>
                  <Text
                    style={[
                      styles.cardNotifSubtitulo,
                      deAmanha.length > 0 && styles.cardNotifSubtituloForte,
                    ]}
                  >
                    {subtituloCard}
                  </Text>
                </View>

                <Pressable
                  style={styles.botaoFechar}
                  accessibilityRole="button"
                  accessibilityLabel="Fechar resumo"
                  hitSlop={10}
                  onPress={() => setResumoFechado(true)}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color="#000000"
                  />
                </Pressable>
              </View>

              {/* Hoje */}
              {hojeVisiveis.length > 0 || maisHoje > 0 ? (
                <View style={styles.resumo}>
                  {hojeVisiveis.map((c) => {
                    const nivel = nivelDaConsulta(c, agora);

                    return (
                      <View key={c.chave} style={styles.resumoLinha}>
                        <MaterialCommunityIcons
                          name={nivel.icone}
                          size={18}
                          color="#000000"
                        />
                        <Text style={styles.resumoTexto}>
                          {nivel.curto}
                          {c.medico ? ` · ${c.medico}` : ''}
                        </Text>
                      </View>
                    );
                  })}

                  {maisHoje > 0 ? (
                    <View style={styles.resumoLinha}>
                      <MaterialCommunityIcons
                        name="calendar-plus"
                        size={18}
                        color="#000000"
                      />
                      <Text style={styles.resumoTexto}>
                        +{maisHoje} consulta{maisHoje > 1 ? 's' : ''} hoje
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {/* Amanhã: em destaque (fundo branco, borda preta, etiqueta escura) */}
              {amanhaVisiveis.map((c) => {
                const hora = formatarHorario(c.horario);

                return (
                  <View key={c.chave} style={styles.destaqueAmanha}>
                    <View style={styles.destaqueTopo}>
                      <View style={styles.pillAmanha}>
                        <MaterialCommunityIcons
                          name="calendar-arrow-right"
                          size={18}
                          color="#FFE16A"
                        />
                        <Text style={styles.pillAmanhaTexto}>AMANHÃ</Text>
                      </View>

                      {hora ? (
                        <Text style={styles.destaqueHora}>às {hora}</Text>
                      ) : null}
                    </View>

                    {c.medico ? (
                      <Text style={styles.destaqueMedico}>{c.medico}</Text>
                    ) : null}

                    {c.local ? (
                      <View style={styles.destaqueLocalLinha}>
                        <MaterialCommunityIcons
                          name="map-marker-outline"
                          size={18}
                          color="#000000"
                        />
                        <Text style={styles.destaqueLocal}>{c.local}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}

              {maisAmanha > 0 ? (
                <View style={styles.resumo}>
                  <View style={styles.resumoLinha}>
                    <MaterialCommunityIcons
                      name="calendar-plus"
                      size={18}
                      color="#000000"
                    />
                    <Text style={styles.resumoTexto}>
                      +{maisAmanha} consulta{maisAmanha > 1 ? 's' : ''} amanhã
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* Depois de amanhã e pedidos: só uma linha de contagem */}
              {deDepois.length > 0 || qtdPedidos > 0 ? (
                <View style={styles.resumo}>
                  {deDepois.length > 0 ? (
                    <View style={styles.resumoLinha}>
                      <MaterialCommunityIcons
                        name="calendar-clock-outline"
                        size={18}
                        color="#000000"
                      />
                      <Text style={styles.resumoTexto}>
                        {deDepois.length} consulta
                        {deDepois.length > 1 ? 's' : ''} depois de amanhã
                      </Text>
                    </View>
                  ) : null}

                  {qtdPedidos > 0 ? (
                    <View style={styles.resumoLinha}>
                      <MaterialCommunityIcons
                        name="account-heart-outline"
                        size={18}
                        color="#000000"
                      />
                      <Text style={styles.resumoTexto}>
                        {qtdPedidos === 1
                          ? '1 pedido de cuidador pendente'
                          : `${qtdPedidos} pedidos de cuidador pendentes`}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              <View style={styles.verMais}>
                <Text style={styles.verMaisTexto}>Toque para ver tudo</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color="#000000"
                />
              </View>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                styles.cardLargo,
                { backgroundColor: corNotif },
                pressed && styles.cardPressionado,
              ]}
              onPress={irParaNotificacoes}
              accessibilityRole="button"
              accessibilityLabel="Notificações"
            >
              <MaterialCommunityIcons
                name={temPendencia ? 'bell-ring-outline' : 'bell-outline'}
                size={48}
                color="#000000"
              />

              <Text style={[styles.cardTexto, styles.cardTextoLargo]}>
                Notificações
              </Text>

              {temPendencia ? (
                <View style={[styles.selo, styles.seloCard]}>
                  <Text style={styles.seloTexto}>{seloTextoTotal}</Text>
                </View>
              ) : null}
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Confirmação de saída, no mesmo padrão dos alertas de notificação */}
      <AlertaModal
        visivel={confirmandoSaida}
        icone="logout"
        corIcone={CORES_ALERTA.vermelho}
        titulo="Quer sair da sua conta?"
        mensagem="Você precisará entrar de novo para ver suas consultas, medicamentos e avisos."
        botoes={[
          {
            texto: 'Sim, sair',
            estilo: 'perigo',
            onPress: confirmarSaida,
          },
          {
            texto: 'Continuar no app',
            estilo: 'neutro',
            onPress: cancelarSaida,
          },
        ]}
        aoFechar={cancelarSaida}
      />
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

  // Sinal de pendência (bolinha vermelha com número)
  selo: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 5,
    backgroundColor: '#D32F2F',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  seloCard: {
    top: 10,
    right: 14,
  },

  seloTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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

  // Textos do card largo "Meus dados" (título + subtítulo, alinhados à esquerda)
  textosLargo: {
    alignItems: 'flex-start',
  },

  cardSubtexto: {
    color: '#000000',
    fontSize: 16,
    marginTop: 4,
  },

  // Card de notificações expandido (altura acompanha o conteúdo)
  cardNotif: {
    width: '100%',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },

  cardNotifTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  cardNotifIcone: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardNotifTituloContainer: {
    flex: 1,
    flexShrink: 1,
  },

  cardNotifTitulo: {
    color: '#000000',
    fontSize: 22,
    fontWeight: 'bold',
  },

  cardNotifSubtitulo: {
    color: '#000000',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 2,
  },

  // Quando o subtítulo fala de "amanhã", ganha mais peso
  cardNotifSubtituloForte: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  botaoFechar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resumo: {
    marginTop: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },

  resumoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  resumoTexto: {
    flex: 1,
    flexShrink: 1,
    color: '#000000',
    fontSize: 16,
    lineHeight: 22,
  },

  // Consulta de amanhã em destaque: branco + borda preta grossa
  destaqueAmanha: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },

  destaqueTopo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },

  pillAmanha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  pillAmanhaTexto: {
    color: '#FFE16A',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  destaqueHora: {
    color: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
  },

  destaqueMedico: {
    color: '#000000',
    fontSize: 19,
    fontWeight: 'bold',
    lineHeight: 25,
  },

  destaqueLocalLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  destaqueLocal: {
    flex: 1,
    flexShrink: 1,
    color: '#000000',
    fontSize: 16,
    lineHeight: 22,
  },

  verMais: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
  },

  verMaisTexto: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Medidas do esqueleto (iguais às do conteúdo real)
  skTitulo: {
    width: 180,
    height: 34,
    borderRadius: 10,
  },

  skSubtitulo: {
    width: 230,
    maxWidth: '100%',
    height: 18,
    borderRadius: 8,
    marginTop: 10,
  },

  skBotaoHeader: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
});