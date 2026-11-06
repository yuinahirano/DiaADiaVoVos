import React, { useCallback, useEffect, useState } from 'react';
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
import {
  SkeletonCabecalho,
  SkeletonLista,
  SkeletonTela,
} from '../../components/Skeleton';
import AlertaModal, { CORES_ALERTA } from '../../components/AlertaModal';
import {
  listarMedicamentosDoIdoso,
  registrarDoseMedicamento,
} from '../../services/api/apiIdoso';

// "10:00:00" -> "10:00"
function formatarHorario(horario) {
  const texto = String(horario ?? '').trim();

  if (/^\d{2}:\d{2}/.test(texto)) {
    return texto.slice(0, 5);
  }

  return texto;
}

// Data/hora do banco -> "dd/mm HH:MM"
function formatarDataHora(valor) {
  if (!valor) return '';

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '';

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const hora = String(data.getHours()).padStart(2, '0');
  const min = String(data.getMinutes()).padStart(2, '0');

  return `${dia}/${mes} ${hora}:${min}`;
}

// tipoFrequencia + valorFrequencia -> texto legível
function formatarFrequencia(tipoFrequencia, valorFrequencia) {
  const valor = Number(valorFrequencia);

  if (!valor) return '—';

  if (tipoFrequencia === 'vezes_por_dia') {
    return valor === 1 ? '1 vez ao dia' : `${valor} vezes ao dia`;
  }

  if (tipoFrequencia === 'intervalo_horas') {
    return valor === 1 ? 'A cada 1 hora' : `A cada ${valor} horas`;
  }

  return '—';
}

const ROTULO_STATUS = {
  ativo: 'Ativo',
  pausado: 'Pausado',
  finalizado: 'Finalizado',
};

const COR_STATUS = {
  ativo: 'rgba(255, 255, 255, 0.65)',
  pausado: 'rgba(255, 221, 120, 0.75)',
  finalizado: 'rgba(200, 200, 200, 0.75)',
};

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

export default function MedicamentosIdoso() {
  const navigation = useNavigation();

  const [medicamentos, setMedicamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');
  // id do medicamento cujo "Tomei" está em andamento (desabilita só aquele botão)
  const [registrandoId, setRegistrandoId] = useState(null);
  // ids cuja dose já foi confirmada nesta sessão: o botão "Tomei" some para
  // eles e só volta a mudar quando o cuidador alterar o status do remédio.
  const [doseConfirmada, setDoseConfirmada] = useState({});

  // Config do AlertaModal (no lugar do Alert nativo)
  const [alerta, setAlerta] = useState({ visivel: false });

  const fecharAlerta = () => setAlerta({ visivel: false });

  const carregar = useCallback(async (puxando = false) => {
    setErro('');

    if (puxando) {
      setAtualizando(true);
    } else {
      setCarregando(true);
    }

    try {
      const lista = await listarMedicamentosDoIdoso();
      setMedicamentos(lista);
    } catch (e) {
      setErro(e?.message || 'Não foi possível carregar os medicamentos.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Marca a dose como tomada: chama o back, atualiza só aquele card na lista
  // e esconde o botão "Tomei" dele — só o cuidador pode mudar depois disso.
  const registrarDose = useCallback(async (item) => {
    setRegistrandoId(item.id);

    try {
      const resultado = await registrarDoseMedicamento(item.id);

      const ultimaDose = resultado?.ultimaDose ?? resultado?.result?.ultimaDose;
      const proximoHorario =
        resultado?.proximoHorario ?? resultado?.result?.proximoHorario;

      setMedicamentos((lista) =>
        lista.map((m) =>
          m.id === item.id
            ? {
                ...m,
                ultimaDose: ultimaDose ?? new Date().toISOString(),
                proximoHorario: proximoHorario ?? m.proximoHorario,
              }
            : m,
        ),
      );

      setDoseConfirmada((atual) => ({ ...atual, [item.id]: true }));
      setAlerta({ visivel: false });
    } catch (e) {
      setAlerta({
        visivel: true,
        icone: 'alert-circle-outline',
        corIcone: CORES_ALERTA.vermelho,
        titulo: 'Não foi possível registrar',
        mensagem: e?.message || 'Tente novamente em instantes.',
        botoes: [
          { texto: 'OK', estilo: 'neutro', onPress: fecharAlerta },
        ],
      });
    } finally {
      setRegistrandoId(null);
    }
  }, []);

  const confirmarDose = (item) => {
    setAlerta({
      visivel: true,
      icone: 'pill',
      corIcone: CORES_ALERTA.azul,
      titulo: 'Registrar dose',
      mensagem: `Confirma que tomou ${item.nome} agora?`,
      botoes: [
        { texto: 'Cancelar', estilo: 'neutro', onPress: fecharAlerta },
        {
          texto: 'Confirmar',
          estilo: 'principal',
          onPress: () => registrarDose(item),
        },
      ],
    });
  };

  const voltar = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // O card não tem altura fixa: cresce conforme o texto de cada campo,
  // e todo texto quebra de linha dentro da sua própria área.
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTopo}>
        <View style={styles.cardIcone}>
          <MaterialCommunityIcons name="pill" size={34} color="#000000" />
        </View>

        <Text style={styles.cardTitulo}>{item.nome}</Text>

        {item.status ? (
          <View
            style={[
              styles.selo,
              { backgroundColor: COR_STATUS[item.status] ?? COR_STATUS.ativo },
            ]}
          >
            <Text style={styles.seloTexto}>
              {ROTULO_STATUS[item.status] ?? item.status}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.campos}>
        <Campo icone="eyedropper-variant" rotulo="Dosagem" valor={item.dosagem} />

        <Campo
          icone="clock-outline"
          rotulo="Horário"
          valor={formatarHorario(item.horario)}
        />

        <Campo
          icone="repeat"
          rotulo="Frequência"
          valor={formatarFrequencia(item.tipoFrequencia, item.valorFrequencia)}
        />

        <Campo
          icone="clock-alert-outline"
          rotulo="Próxima dose"
          valor={formatarDataHora(item.proximoHorario)}
        />

        <Campo
          icone="clock-check-outline"
          rotulo="Última dose"
          valor={formatarDataHora(item.ultimaDose) || 'Ainda não tomada'}
        />
      </View>

      {item.observacoes ? (
        <View style={styles.observacoes}>
          <View style={styles.campoRotuloLinha}>
            <MaterialCommunityIcons
              name="note-text-outline"
              size={18}
              color="#000000"
            />
            <Text style={styles.campoRotulo}>Observações</Text>
          </View>

          <Text style={styles.campoValor}>{item.observacoes}</Text>
        </View>
      ) : null}

      {item.status === 'ativo' && !doseConfirmada[item.id] ? (
        <Pressable
          style={({ pressed }) => [
            styles.botaoTomei,
            (pressed || registrandoId === item.id) && styles.botaoTomeiPressionado,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Registrar dose de ${item.nome}`}
          disabled={registrandoId === item.id}
          onPress={() => confirmarDose(item)}
        >
          {registrandoId === item.id ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={22}
                color="#000000"
              />
              <Text style={styles.botaoTomeiTexto}>Tomei</Text>
            </>
          )}
        </Pressable>
      ) : null}
    </View>
  );

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
          name="pill-off"
          size={56}
          color="#000000"
        />

        <Text style={styles.estadoTexto}>
          Nenhum medicamento cadastrado.
        </Text>
      </View>
    );
  };

  // Primeiro carregamento: esqueleto no lugar do círculo girando
  if (carregando) {
    return (
      <SkeletonTela rotulo="Carregando medicamentos">
        <SkeletonCabecalho />
        <SkeletonLista tipo="campos" quantidade={3} />
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
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color="#000000"
          />
        </Pressable>

        <View style={styles.tituloContainer}>
          <Text style={styles.titulo}>Medicamentos</Text>

          <Text style={styles.subtitulo}>
            Seus remédios e horários
          </Text>
        </View>
      </View>

      <FlatList
        data={medicamentos}
        keyExtractor={(item, index) =>
          String(item.id ?? `${item.nome}-${index}`)
        }
        renderItem={renderItem}
        ListEmptyComponent={renderVazio}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => carregar(true)}
            colors={['#C8ACE4']}
          />
        }
      />

      <AlertaModal
        visivel={alerta.visivel}
        icone={alerta.icone}
        corIcone={alerta.corIcone}
        titulo={alerta.titulo}
        mensagem={alerta.mensagem}
        botoes={alerta.botoes}
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

  // Sem altura fixa: o card acompanha o tamanho do conteúdo
  card: {
    backgroundColor: '#C8ACE4',
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
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitulo: {
    flex: 1,
    flexShrink: 1,
    color: '#000000',
    fontSize: 22,
    fontWeight: 'bold',
  },

  selo: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  seloTexto: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },

  // Cada campo ocupa metade da linha (ou a linha toda se não couber)
  // e o texto quebra dentro dele, então nada se sobrepõe.
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
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
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

  observacoes: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 10,
  },

  botaoTomei: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 13,
    marginTop: 16,
  },

  botaoTomeiPressionado: {
    opacity: 0.75,
  },

  botaoTomeiTexto: {
    color: '#000000',
    fontSize: 17,
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