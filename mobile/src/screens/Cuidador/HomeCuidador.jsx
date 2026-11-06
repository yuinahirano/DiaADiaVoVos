import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AlertaModal, { CORES_ALERTA } from '../../components/AlertaModal';
import FormularioModal from '../../components/FormularioModal';
import { SkeletonBloco } from '../../components/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import { useTema } from '../../contexts/TemaContext';
import { useIdosoSelecionado } from '../../contexts/IdosoSelecionadoContext';
import {
  listarIdososDoCuidador,
  solicitarVinculoPorEmail,
} from '../../services/api/apiCuidador';

// Campos do formulário de solicitação (diasParaExpirar NÃO aparece: é sempre 3)
const CAMPOS_SOLICITACAO = [
  {
    chave: 'emailIdoso',
    rotulo: 'E-mail do idoso',
    placeholder: 'idoso@email.com',
    teclado: 'email-address',
    maxLength: 120,
  },
  {
    chave: 'contatoEmergencia',
    rotulo: 'Contato de emergência',
    placeholder: '(DD)9XXXX-XXXX',
    teclado: 'phone-pad',
    maxLength: 15,
  },
];

const FORM_VAZIO = { emailIdoso: '', contatoEmergencia: '' };

export default function HomeCuidador({ onLogout }) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { cores, escuro, alternar } = useTema();
  const { selecionarIdoso } = useIdosoSelecionado();

  const styles = useMemo(() => criarStyles(cores), [cores]);

  const [idosos, setIdosos] = useState([]);
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [erro, setErro] = useState(false);
  const [configAberta, setConfigAberta] = useState(false);
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  // Formulário de solicitação de vínculo
  const [formAberto, setFormAberto] = useState(false);
  const [valoresForm, setValoresForm] = useState(FORM_VAZIO);
  const [errosForm, setErrosForm] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [sucessoAberto, setSucessoAberto] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const lista = await listarIdososDoCuidador();
      setIdosos(lista);
      setErro(false);
    } catch (e) {
      setErro(true);
    } finally {
      setCarregandoInicial(false);
    }
  }, []);

  // Toda vez que a Home ganha foco, recarrega (depois do 1º carregamento é silencioso)
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      (async () => {
        try {
          const lista = await listarIdososDoCuidador();

          if (ativo) {
            setIdosos(lista);
            setErro(false);
          }
        } catch (e) {
          if (ativo) {
            setErro(true);
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

  const total = idosos.length;

  const subtitulo =
    total === 0
      ? 'Nenhum idoso vinculado ainda'
      : `Você cuida de ${total} idoso${total > 1 ? 's' : ''}`;

  const abrirConfig = () => setConfigAberta(true);
  const fecharConfig = () => setConfigAberta(false);

  // Fecha as configurações antes de abrir a confirmação (dois Modals juntos dão problema no iOS)
  const pedirSaida = () => {
    setConfigAberta(false);
    setTimeout(() => setConfirmandoSaida(true), 250);
  };

  const cancelarSaida = () => setConfirmandoSaida(false);

  const confirmarSaida = () => {
    setConfirmandoSaida(false);

    if (onLogout) {
      onLogout();
    } else {
      navigation.navigate('Login');
    }
  };

  const abrirIdoso = (idoso) => {
    selecionarIdoso(idoso);
    navigation.navigate('DetalhesIdoso');
  };

  // ---------- Solicitação de vínculo ----------
  const abrirForm = () => {
    setValoresForm(FORM_VAZIO);
    setErrosForm({});
    setFormAberto(true);
  };

  const fecharForm = () => {
    if (!enviando) {
      setFormAberto(false);
    }
  };

  const mudarCampo = (chave, texto) => {
    setValoresForm((v) => ({ ...v, [chave]: texto }));
    setErrosForm((e) => ({ ...e, [chave]: undefined }));
  };

  const validarForm = () => {
    const novos = {};
    const email = valoresForm.emailIdoso.trim();
    const telefone = valoresForm.contatoEmergencia.replace(/\D/g, '');

    if (!email) {
      novos.emailIdoso = 'Digite o e-mail do idoso.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      novos.emailIdoso = 'E-mail inválido.';
    }

    if (!telefone) {
      novos.contatoEmergencia = 'Digite o contato de emergência.';
    } else if (telefone.length < 10 || telefone.length > 11) {
      novos.contatoEmergencia = 'Digite o telefone com DDD.';
    }

    setErrosForm(novos);

    return Object.keys(novos).length === 0;
  };

  const enviarSolicitacao = async () => {
    if (enviando || !validarForm()) {
      return;
    }

    setEnviando(true);

    try {
      await solicitarVinculoPorEmail(valoresForm);

      setFormAberto(false);
      // Espera o 1º Modal fechar antes de abrir o 2º (problema no iOS)
      setTimeout(() => setSucessoAberto(true), 250);
    } catch (e) {
      const d = e?.response?.data;
      const mensagem =
        d?.message ??
        d?.mensagem ??
        d?.error ??
        d?.erro ??
        'Não foi possível enviar a solicitação. Tente de novo.';

      // Mostra o erro dentro do formulário, sem abrir outro Modal
      setErrosForm({ emailIdoso: String(mensagem) });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={cores.fundo} barStyle={cores.statusBar} />

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
              {carregandoInicial ? 'Carregando seus idosos...' : subtitulo}
            </Text>
          </View>

          <View style={styles.acoes}>
            <Pressable
              style={styles.botaoHeader}
              accessibilityRole="button"
              accessibilityLabel="Adicionar idoso"
              onPress={abrirForm}
            >
              <MaterialCommunityIcons
                name="account-plus-outline"
                size={28}
                color={cores.texto}
              />
            </Pressable>

            <Pressable
              style={styles.botaoHeader}
              accessibilityRole="button"
              accessibilityLabel="Configurações"
              onPress={abrirConfig}
            >
              <MaterialCommunityIcons
                name="cog-outline"
                size={28}
                color={cores.texto}
              />
            </Pressable>
          </View>
        </View>

        {carregandoInicial ? (
          <View accessible accessibilityLabel="Carregando idosos">
            {[0, 1, 2].map((i) => (
              <SkeletonBloco key={i} style={styles.skCard} />
            ))}
          </View>
        ) : erro ? (
          <View style={styles.vazio}>
            <MaterialCommunityIcons
              name="wifi-alert"
              size={56}
              color={cores.texto}
            />

            <Text style={styles.vazioTitulo}>Não deu para carregar</Text>

            <Text style={styles.vazioTexto}>
              Verifique sua conexão e tente de novo.
            </Text>

            <Pressable
              style={styles.botaoTentar}
              accessibilityRole="button"
              accessibilityLabel="Tentar de novo"
              onPress={() => {
                setCarregandoInicial(true);
                carregar();
              }}
            >
              <Text style={styles.botaoTentarTexto}>Tentar de novo</Text>
            </Pressable>
          </View>
        ) : total === 0 ? (
          <View style={styles.vazio}>
            <MaterialCommunityIcons
              name="account-heart-outline"
              size={56}
              color={cores.texto}
            />

            <Text style={styles.vazioTitulo}>Nenhum idoso por aqui</Text>

            <Text style={styles.vazioTexto}>
              Quando um idoso aceitar seu pedido de cuidador, ele aparece aqui.
            </Text>

            <Pressable
              style={styles.botaoTentar}
              accessibilityRole="button"
              accessibilityLabel="Solicitar vínculo com um idoso"
              onPress={abrirForm}
            >
              <Text style={styles.botaoTentarTexto}>Solicitar vínculo</Text>
            </Pressable>
          </View>
        ) : (
          idosos.map((idoso, i) => {
            const nomeIdoso = idoso?.nome ?? 'Idoso';
            const chave = String(
              idoso?.id_vinculo ?? `${idoso?.id ?? 'idoso'}-${i}`,
            );

            return (
              <Pressable
                key={chave}
                style={({ pressed }) => [
                  styles.cardIdoso,
                  { backgroundColor: cores.cards[i % cores.cards.length] },
                  pressed && styles.cardPressionado,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Abrir ${nomeIdoso}`}
                onPress={() => abrirIdoso(idoso)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarTexto}>
                    {nomeIdoso.trim().charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.cardIdosoTextos}>
                  <Text style={styles.cardIdosoNome} numberOfLines={2}>
                    {nomeIdoso}
                  </Text>

                  <Text style={styles.cardIdosoDica}>Toque para ver</Text>
                </View>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={30}
                  color="#000000"
                />
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* Configurações: tema e sair */}
      <Modal
        visible={configAberta}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={fecharConfig}
      >
        <View style={styles.fundoModal}>
          <View style={styles.caixaModal}>
            <View style={styles.modalTopo}>
              <Text style={styles.modalTitulo}>Configurações</Text>

              <Pressable
                style={styles.botaoFechar}
                accessibilityRole="button"
                accessibilityLabel="Fechar configurações"
                hitSlop={10}
                onPress={fecharConfig}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={cores.texto}
                />
              </Pressable>
            </View>

            <View style={styles.linhaTema}>
              <MaterialCommunityIcons
                name={escuro ? 'weather-night' : 'white-balance-sunny'}
                size={32}
                color={cores.texto}
              />

              <View style={styles.linhaTemaTextos}>
                <Text style={styles.linhaTemaTitulo}>Tema escuro</Text>
                <Text style={styles.linhaTemaSub}>
                  {escuro ? 'Ligado' : 'Desligado'}
                </Text>
              </View>

              <Switch
                value={escuro}
                onValueChange={alternar}
                accessibilityRole="switch"
                accessibilityLabel="Tema escuro"
                trackColor={{ false: '#9AA5BD', true: CORES_ALERTA.azul }}
                thumbColor="#FFFFFF"
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.botaoSair,
                pressed && styles.cardPressionado,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Sair da conta"
              onPress={pedirSaida}
            >
              <MaterialCommunityIcons name="logout" size={26} color="#FFFFFF" />
              <Text style={styles.botaoSairTexto}>Sair da conta</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <AlertaModal
        visivel={confirmandoSaida}
        icone="logout"
        corIcone={CORES_ALERTA.vermelho}
        titulo="Quer sair da sua conta?"
        mensagem="Você precisará entrar de novo para acompanhar seus idosos."
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

      {/* Formulário: solicitar vínculo com idoso pelo e-mail */}
      <FormularioModal
        visivel={formAberto}
        icone="account-plus-outline"
        titulo="Solicitar vínculo"
        campos={CAMPOS_SOLICITACAO}
        valores={valoresForm}
        erros={errosForm}
        salvando={enviando}
        textoConfirmar="Enviar solicitação"
        aoMudar={mudarCampo}
        aoConfirmar={enviarSolicitacao}
        aoCancelar={fecharForm}
      />

      <AlertaModal
        visivel={sucessoAberto}
        icone="check-circle-outline"
        corIcone={CORES_ALERTA.azul}
        titulo="Solicitação enviada"
        mensagem="O idoso tem 3 dias para aceitar o seu pedido."
        botoes={[
          {
            texto: 'Ok',
            estilo: 'neutro',
            onPress: () => setSucessoAberto(false),
          },
        ]}
        aoFechar={() => setSucessoAberto(false)}
      />
    </SafeAreaView>
  );
}

// Estilos dependem do tema, então são gerados a partir das cores
const criarStyles = (cores) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: cores.fundo,
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
      color: cores.texto,
    },

    subtitulo: {
      fontSize: 16,
      color: cores.textoSecundario,
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
      backgroundColor: cores.botaoHeader,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Cards dos idosos (texto sempre preto sobre pastel)
    cardIdoso: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      borderRadius: 24,
      padding: 18,
      marginBottom: 14,
    },

    cardPressionado: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },

    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    avatarTexto: {
      color: '#000000',
      fontSize: 26,
      fontWeight: 'bold',
    },

    cardIdosoTextos: {
      flex: 1,
      flexShrink: 1,
    },

    cardIdosoNome: {
      color: '#000000',
      fontSize: 22,
      fontWeight: 'bold',
    },

    cardIdosoDica: {
      color: '#000000',
      fontSize: 16,
      marginTop: 2,
    },

    // Esqueleto da lista
    skCard: {
      height: 92,
      borderRadius: 24,
      marginBottom: 14,
      backgroundColor: cores.skeleton,
    },

    // Estados vazio e erro
    vazio: {
      alignItems: 'center',
      backgroundColor: cores.superficie,
      borderRadius: 24,
      paddingHorizontal: 22,
      paddingVertical: 32,
      gap: 10,
    },

    vazioTitulo: {
      color: cores.texto,
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 6,
    },

    vazioTexto: {
      color: cores.textoSecundario,
      fontSize: 17,
      lineHeight: 24,
      textAlign: 'center',
    },

    botaoTentar: {
      minHeight: 54,
      alignSelf: 'stretch',
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: CORES_ALERTA.azul,
      marginTop: 12,
    },

    botaoTentarTexto: {
      color: '#FFFFFF',
      fontSize: 19,
      fontWeight: 'bold',
    },

    // Modal de configurações
    fundoModal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },

    caixaModal: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: cores.superficie,
      borderRadius: 28,
      paddingHorizontal: 22,
      paddingTop: 22,
      paddingBottom: 22,
    },

    modalTopo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },

    modalTitulo: {
      color: cores.texto,
      fontSize: 24,
      fontWeight: 'bold',
    },

    botaoFechar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: cores.botaoHeader,
      alignItems: 'center',
      justifyContent: 'center',
    },

    linhaTema: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      borderWidth: 2,
      borderColor: cores.borda,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },

    linhaTemaTextos: {
      flex: 1,
    },

    linhaTemaTitulo: {
      color: cores.texto,
      fontSize: 19,
      fontWeight: 'bold',
    },

    linhaTemaSub: {
      color: cores.textoSecundario,
      fontSize: 16,
      marginTop: 2,
    },

    botaoSair: {
      minHeight: 58,
      flexDirection: 'row',
      gap: 10,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: CORES_ALERTA.vermelho,
      marginTop: 18,
    },

    botaoSairTexto: {
      color: '#FFFFFF',
      fontSize: 19,
      fontWeight: 'bold',
    },
  });