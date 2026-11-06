import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AlertaModal, { CORES_ALERTA } from '../../components/AlertaModal';
import {
  SkeletonCabecalho,
  SkeletonLista,
  SkeletonTela,
} from '../../components/Skeleton';
import {
  aceitarSolicitacao,
  listarAvisosDoIdoso,
  recusarSolicitacao,
} from '../../services/api/apiIdoso';
import {
  consultasProximas,
  formatarData,
  formatarHorario,
  nivelDaConsulta,
} from '../../utils/avisosIdoso';

const doisDigitos = (n) => String(n).padStart(2, '0');

// "91962220071" -> "(91) 96222-0071"
function formatarTelefone(valor) {
  const digitos = String(valor ?? '').replace(/\D/g, '');

  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  }

  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }

  return String(valor ?? '').trim();
}

// "2026-10-13T01:13:14.000Z" -> "12/10/2026 às 22:13" (horário do aparelho)
function formatarExpiracao(valor) {
  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return '';
  }

  return `${doisDigitos(data.getDate())}/${doisDigitos(
    data.getMonth() + 1,
  )}/${data.getFullYear()} às ${doisDigitos(data.getHours())}:${doisDigitos(
    data.getMinutes(),
  )}`;
}

function Campo({ icone, rotulo, valor }) {
  return (
    <View style={styles.campo}>
      <View style={styles.campoRotuloLinha}>
        <MaterialCommunityIcons name={icone} size={18} color="#000000" />
        <Text style={styles.campoRotulo}>{rotulo}</Text>
      </View>

      <Text style={styles.campoValor}>{valor || '—'}</Text>
    </View>
  );
}

export default function NotificacoesIdoso() {
  const navigation = useNavigation();

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  // "agora" em estado: a cor e o "Começa em..." se atualizam sozinhos
  const [agora, setAgora] = useState(Date.now());
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');
  // id da solicitação que está sendo aceita/recusada (trava os botões)
  const [processando, setProcessando] = useState(null);
  // alerta estilizado atual (null = nenhum)
  const [alerta, setAlerta] = useState(null);

  const carregar = useCallback(async (puxando = false) => {
    setErro('');

    if (puxando) {
      setAtualizando(true);
    } else {
      setCarregando(true);
    }

    try {
      const avisos = await listarAvisosDoIdoso();
      setSolicitacoes(avisos.solicitacoes);
      setConsultas(avisos.consultas);
      setAgora(Date.now());
    } catch (e) {
      setErro(e?.message || 'Não foi possível carregar as notificações.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Atualiza o relógio a cada minuto
  useEffect(() => {
    const timer = setInterval(() => setAgora(Date.now()), 60000);

    return () => clearInterval(timer);
  }, []);

  // Ordem: consultas de hoje, pedidos de cuidador, consultas de amanhã/depois
  const avisos = useMemo(() => {
    const deConsulta = consultasProximas(consultas, agora).map((c) => ({
      tipo: 'consulta',
      chave: c.chave,
      dados: c,
      prioridade: c.dias === 0 ? 0 : 2,
    }));

    const deSolicitacao = solicitacoes.map((s, i) => ({
      tipo: 'solicitacao',
      chave: `solicitacao-${s.id ?? i}`,
      dados: s,
      prioridade: 1,
    }));

    return [...deConsulta, ...deSolicitacao].sort(
      (a, b) => a.prioridade - b.prioridade,
    );
  }, [consultas, solicitacoes, agora]);

  const voltar = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const fecharAlerta = () => setAlerta(null);

  const responder = async (item, aceitar) => {
    setProcessando(item.id);

    try {
      if (aceitar) {
        await aceitarSolicitacao(item.id);
      } else {
        await recusarSolicitacao(item.id);
      }

      setSolicitacoes((atual) => atual.filter((s) => s.id !== item.id));

      setAlerta({
        icone: aceitar ? 'check-circle-outline' : 'close-circle-outline',
        corIcone: aceitar ? CORES_ALERTA.verde : CORES_ALERTA.vermelho,
        titulo: aceitar ? 'Solicitação aceita' : 'Solicitação recusada',
        botoes: [{ texto: 'Ok', estilo: 'neutro', onPress: fecharAlerta }],
      });
    } catch (e) {
      setAlerta({
        icone: 'alert-circle-outline',
        corIcone: CORES_ALERTA.vermelho,
        titulo: 'Não foi possível responder',
        mensagem: e?.message || 'Tente novamente.',
        botoes: [{ texto: 'Ok', estilo: 'neutro', onPress: fecharAlerta }],
      });
    } finally {
      setProcessando(null);
    }
  };

  // Pergunta antes de enviar, para evitar toque sem querer
  const confirmar = (item, aceitar) => {
    setAlerta({
      icone: aceitar ? 'account-check-outline' : 'account-remove-outline',
      corIcone: aceitar ? CORES_ALERTA.verde : CORES_ALERTA.vermelho,
      titulo: aceitar ? 'Aceitar solicitação?' : 'Recusar solicitação?',
      mensagem: aceitar
        ? 'Este cuidador poderá acompanhar a sua saúde.'
        : 'Este cuidador não será vinculado a você.',
      botoes: [
        {
          texto: aceitar ? 'Sim, aceitar' : 'Sim, recusar',
          estilo: aceitar ? 'principal' : 'perigo',
          onPress: () => {
            fecharAlerta();
            responder(item, aceitar);
          },
        },
        { texto: 'Voltar', estilo: 'neutro', onPress: fecharAlerta },
      ],
    });
  };

  // Card de consulta: a cor muda conforme a proximidade
  const renderConsulta = (c) => {
    const nivel = nivelDaConsulta(c, agora);

    return (
      <View style={[styles.card, { backgroundColor: nivel.cor }]}>
        <View style={styles.cardTopo}>
          <View style={styles.cardIcone}>
            <MaterialCommunityIcons
              name="calendar-clock-outline"
              size={34}
              color="#000000"
            />
          </View>

          <View style={styles.cardTituloContainer}>
            <Text style={styles.cardTitulo}>{c.medico || 'Consulta'}</Text>

            <View style={styles.selo}>
              <MaterialCommunityIcons
                name={nivel.icone}
                size={16}
                color="#000000"
              />
              <Text style={styles.seloTexto}>{nivel.rotulo}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.cardDetalhe}>{nivel.detalhe}</Text>

        <View style={styles.campos}>
          <Campo
            icone="calendar-month-outline"
            rotulo="Data"
            valor={formatarData(c.data)}
          />
          <Campo
            icone="clock-outline"
            rotulo="Horário"
            valor={formatarHorario(c.horario)}
          />
        </View>

        <View style={styles.blocoLargo}>
          <View style={styles.campoRotuloLinha}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={18}
              color="#000000"
            />
            <Text style={styles.campoRotulo}>Local</Text>
          </View>

          <Text style={styles.campoValor}>{c.local || '—'}</Text>
        </View>

        {c.descricao ? (
          <View style={styles.blocoLargo}>
            <View style={styles.campoRotuloLinha}>
              <MaterialCommunityIcons
                name="note-text-outline"
                size={18}
                color="#000000"
              />
              <Text style={styles.campoRotulo}>Descrição</Text>
            </View>

            <Text style={styles.campoValor}>{c.descricao}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  // Card de pedido de cuidador (verde), com aceitar/recusar
  const renderSolicitacao = (item) => {
    const ocupado = processando === item.id;
    const expiracao = formatarExpiracao(item.expira_em ?? item.expiraEm);
    const contato = item.contato_emergencia ?? item.contatoEmergencia;

    return (
      <View style={[styles.card, { backgroundColor: '#A6D8B7' }]}>
        <View style={styles.cardTopo}>
          <View style={styles.cardIcone}>
            <MaterialCommunityIcons
              name="account-heart-outline"
              size={34}
              color="#000000"
            />
          </View>

          <View style={styles.cardTituloContainer}>
            <Text style={styles.cardTitulo}>Pedido de cuidador</Text>

            <Text style={styles.cardSubtitulo}>
              Alguém quer acompanhar a sua saúde.
            </Text>
          </View>
        </View>

        <View style={styles.campos}>
          <Campo
            icone="phone-alert-outline"
            rotulo="Contato de emergência"
            valor={formatarTelefone(contato)}
          />

          {expiracao ? (
            <Campo icone="timer-sand" rotulo="Expira em" valor={expiracao} />
          ) : null}
        </View>

        {/* Verde = aceitar, vermelho = recusar; sempre com ícone e texto,
            para não depender só da cor */}
        <View style={styles.botoes}>
          <Pressable
            style={({ pressed }) => [
              styles.botao,
              styles.botaoRecusar,
              (pressed || ocupado) && styles.botaoPressionado,
            ]}
            disabled={ocupado}
            accessibilityRole="button"
            accessibilityLabel="Recusar solicitação"
            onPress={() => confirmar(item, false)}
          >
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={24}
              color={CORES_ALERTA.vermelho}
            />
            <Text style={styles.botaoRecusarTexto}>Recusar</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.botao,
              styles.botaoAceitar,
              (pressed || ocupado) && styles.botaoPressionado,
            ]}
            disabled={ocupado}
            accessibilityRole="button"
            accessibilityLabel="Aceitar solicitação"
            onPress={() => confirmar(item, true)}
          >
            {ocupado ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.botaoAceitarTexto}>Aceitar</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }) =>
    item.tipo === 'consulta'
      ? renderConsulta(item.dados)
      : renderSolicitacao(item.dados);

  const renderVazio = () => {
    if (carregando) {
      return null;
    }

    if (erro) {
      return (
        <View style={styles.estado}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={56}
            color="#000000"
          />

          <Text style={styles.estadoTexto}>{erro}</Text>

          <Pressable
            style={styles.botaoTentar}
            accessibilityRole="button"
            accessibilityLabel="Tentar novamente"
            onPress={() => carregar()}
          >
            <Text style={styles.botaoTentarTexto}>Tentar novamente</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.estado}>
        <MaterialCommunityIcons
          name="bell-off-outline"
          size={56}
          color="#000000"
        />

        <Text style={styles.estadoTexto}>Nenhuma notificação no momento.</Text>
      </View>
    );
  };

  // Primeiro carregamento: esqueleto no lugar do círculo girando
  if (carregando) {
    return (
      <SkeletonTela rotulo="Carregando notificações">
        <SkeletonCabecalho />
        <SkeletonLista quantidade={3} />
      </SkeletonTela>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#EAF1FF" barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable
          style={styles.botaoHeader}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={voltar}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#000000" />
        </Pressable>

        <View style={styles.tituloContainer}>
          <Text style={styles.titulo}>Notificações</Text>

          <Text style={styles.subtitulo}>
            Pedidos e consultas dos próximos dias
          </Text>
        </View>
      </View>

      <FlatList
        data={avisos}
        keyExtractor={(item) => item.chave}
        renderItem={renderItem}
        ListEmptyComponent={renderVazio}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => carregar(true)}
            colors={['#A6D8B7']}
          />
        }
      />

      <AlertaModal
        visivel={alerta !== null}
        icone={alerta?.icone}
        corIcone={alerta?.corIcone}
        titulo={alerta?.titulo}
        mensagem={alerta?.mensagem}
        botoes={alerta?.botoes}
        aoFechar={fecharAlerta}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EAF1FF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    marginBottom: 24,
  },

  botaoHeader: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  tituloContainer: {
    flex: 1,
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

  lista: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // Sem altura fixa: o card acompanha o conteúdo.
  // A cor de fundo vem inline (consulta = por proximidade, pedido = verde).
  card: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },

  cardTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  cardIcone: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTituloContainer: {
    flex: 1,
    flexShrink: 1,
    alignItems: 'flex-start',
    gap: 8,
  },

  cardTitulo: {
    flexShrink: 1,
    color: '#000000',
    fontSize: 22,
    fontWeight: 'bold',
  },

  cardSubtitulo: {
    color: '#000000',
    fontSize: 16,
    lineHeight: 22,
  },

  cardDetalhe: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 14,
  },

  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },

  seloTexto: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Cada campo ocupa metade da linha (ou a linha toda se não couber)
  campos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },

  campo: {
    flexGrow: 1,
    flexBasis: '45%',
    flexShrink: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  campoRotuloLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  campoRotulo: {
    flexShrink: 1,
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },

  campoValor: {
    color: '#000000',
    fontSize: 17,
    lineHeight: 23,
    marginTop: 4,
  },

  blocoLargo: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 10,
  },

  botoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },

  botao: {
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    paddingHorizontal: 12,
  },

  // Branco com borda e texto vermelhos: destaca sobre o card verde
  botaoRecusar: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: CORES_ALERTA.vermelho,
  },

  // Verde escuro com texto branco: contraste alto sobre o card verde claro
  botaoAceitar: {
    backgroundColor: CORES_ALERTA.verde,
  },

  botaoPressionado: {
    opacity: 0.7,
  },

  botaoRecusarTexto: {
    color: CORES_ALERTA.vermelho,
    fontSize: 19,
    fontWeight: 'bold',
  },

  botaoAceitarTexto: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
  },

  estado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    gap: 14,
  },

  estadoTexto: {
    color: '#333333',
    fontSize: 18,
    textAlign: 'center',
  },

  botaoTentar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 6,
  },

  botaoTentarTexto: {
    color: '#000000',
    fontSize: 17,
    fontWeight: 'bold',
  },
});