import React, { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SkeletonBloco } from '../../components/Skeleton';
import { carregarMeusDados } from '../../services/api/apiIdoso';

// Tela só de visualização: o idoso vê os próprios dados, sem editar nada.

// Cores fixas (o app do idoso não usa o tema claro/escuro)
const COR_FUNDO = '#EAF1FF';
const COR_SUPERFICIE = '#FFFFFF';
const COR_TEXTO = '#000000';
const COR_TEXTO_SECUNDARIO = '#444444';
const COR_BORDA = '#D6E2FA';
const COR_BOTAO = '#FFFFFF';

// ---------- Formatação ----------
const soDigitos = (texto) => String(texto ?? '').replace(/\D/g, '');

const vazio = (valor) =>
  valor === undefined || valor === null || String(valor).trim() === '';

const ou = (valor) => (vazio(valor) ? '—' : String(valor));

// Primeiro valor preenchido (ignora objetos), para aceitar vários nomes de campo
const primeiro = (...valores) => {
  for (const v of valores) {
    if (!vazio(v) && typeof v !== 'object') {
      return v;
    }
  }

  return '';
};

// "0000" (só zeros) significa endereço sem número
const semNumero = (numero) => /^0+$/.test(soDigitos(numero));

const textoNumero = (numero) => {
  if (vazio(numero)) {
    return '—';
  }

  return semNumero(numero) ? 'Sem número' : String(numero);
};

function formatarCpf(valor) {
  const d = soDigitos(valor);

  return d.length === 11
    ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : ou(valor);
}

function formatarCep(valor) {
  const d = soDigitos(valor);

  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : ou(valor);
}

function formatarTelefone(valor) {
  const d = soDigitos(valor);

  if (d.length === 11) {
    return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  if (d.length === 10) {
    return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return ou(valor);
}

// "1995-06-15T03:00:00.000Z" -> { texto: "15/06/1995", idade: 31 }
// Usa só a parte da data do texto, para o fuso não mudar o dia.
function dataEIdade(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso ?? ''));

  if (!m) {
    return { texto: '—', idade: null };
  }

  const [, ano, mes, dia] = m;
  const hoje = new Date();

  let idade = hoje.getFullYear() - Number(ano);

  const aindaNaoFez =
    hoje.getMonth() + 1 < Number(mes) ||
    (hoje.getMonth() + 1 === Number(mes) && hoje.getDate() < Number(dia));

  if (aindaNaoFez) {
    idade -= 1;
  }

  return {
    texto: `${dia}/${mes}/${ano}`,
    idade: idade >= 0 ? idade : null,
  };
}

function capitalizar(texto) {
  const t = String(texto ?? '').trim();

  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '—';
}

// A API de doenças pode usar nomes diferentes de campo: tenta os mais comuns
function nomeDaDoenca(d) {
  return d?.nome ?? d?.nome_doenca ?? d?.doenca ?? d?.descricao ?? 'Doença';
}

// Deixa o endereço sempre no mesmo formato, não importa o nome dos campos da API.
// O CEP volta com 8 dígitos (completa zeros à esquerda perdidos pelo banco).
function normalizarEndereco(e) {
  const origem = e ?? {};
  const aninhado =
    [origem.cep, origem.cep_info, origem.viacep].find(
      (x) => x && typeof x === 'object',
    ) ?? {};
  const f = { ...aninhado, ...origem };

  const cepDigitos = soDigitos(
    primeiro(f.cep, aninhado.cep, f.CEP, f.codigo_postal, f.id_cep),
  );

  const cep =
    cepDigitos.length > 0 && cepDigitos.length < 8
      ? cepDigitos.padStart(8, '0')
      : cepDigitos;

  return {
    id: origem.id ?? origem.id_endereco ?? null,
    nome: primeiro(f.nome, f.apelido),
    logradouro: primeiro(f.logradouro, f.rua, f.endereco, f.nome_rua),
    numero: origem.numero ?? f.num ?? '',
    complemento: primeiro(f.complemento),
    bairro: primeiro(f.bairro, f.distrito),
    cidade: primeiro(f.cidade, f.localidade, f.municipio),
    uf: primeiro(f.uf, f.UF, f.sigla_uf, f.estado),
    cep,
  };
}

// Resumo curto, mostrado com o endereço fechado
function resumoEndereco(e) {
  const rua = [
    vazio(e.logradouro) ? '' : String(e.logradouro),
    vazio(e.numero) ? '' : semNumero(e.numero) ? 's/n' : String(e.numero),
  ]
    .filter(Boolean)
    .join(', ');

  const cidade = [e.cidade, e.uf].filter((x) => !vazio(x)).join(' - ');

  return [rua, cidade].filter(Boolean).join(' · ') || formatarCep(e.cep);
}

// ---------- Componentes ----------
// Linha "rótulo: valor" dentro dos cartões
function Linha({ rotulo, valor }) {
  return (
    <View
      style={styles.linha}
      accessible
      accessibilityLabel={`${rotulo}: ${valor}`}
    >
      <Text style={styles.linhaRotulo}>{rotulo}</Text>
      <Text style={styles.linhaValor}>{valor}</Text>
    </View>
  );
}

// Cartão de seção
function Secao({ icone, titulo, children }) {
  return (
    <View style={styles.secao}>
      <View style={styles.secaoTopo}>
        <MaterialCommunityIcons name={icone} size={30} color={COR_TEXTO} />

        <Text style={styles.secaoTitulo}>{titulo}</Text>
      </View>

      {children}
    </View>
  );
}

// Um endereço: fechado mostra nome + resumo; ao tocar abre os detalhes
function CartaoEndereco({ endereco, posicao, total }) {
  const [aberto, setAberto] = useState(false);

  const titulo = !vazio(endereco.nome)
    ? String(endereco.nome)
    : total > 1
      ? `Endereço ${posicao}`
      : 'Endereço';

  return (
    <View style={styles.enderecoCard}>
      <Pressable
        style={({ pressed }) => [
          styles.enderecoCabeca,
          pressed && styles.pressionado,
        ]}
        accessibilityRole="button"
        accessibilityState={{ expanded: aberto }}
        accessibilityLabel={`${titulo}. ${
          aberto
            ? 'Toque para esconder os detalhes'
            : 'Toque para ver todos os detalhes'
        }`}
        onPress={() => setAberto((v) => !v)}
      >
        <View style={styles.enderecoTextos}>
          <Text style={styles.enderecoTitulo} numberOfLines={2}>
            {titulo}
          </Text>

          {!aberto ? (
            <Text style={styles.enderecoResumo} numberOfLines={2}>
              {resumoEndereco(endereco)}
            </Text>
          ) : null}
        </View>

        <MaterialCommunityIcons
          name={aberto ? 'chevron-up' : 'chevron-down'}
          size={32}
          color={COR_TEXTO}
        />
      </Pressable>

      {aberto ? (
        <>
          <Linha rotulo="Logradouro" valor={ou(endereco.logradouro)} />
          <Linha rotulo="Número" valor={textoNumero(endereco.numero)} />
          <Linha rotulo="Complemento" valor={ou(endereco.complemento)} />
          <Linha rotulo="Bairro" valor={ou(endereco.bairro)} />
          <Linha rotulo="Cidade" valor={ou(endereco.cidade)} />
          <Linha rotulo="UF" valor={ou(endereco.uf)} />
          <Linha rotulo="CEP" valor={formatarCep(endereco.cep)} />
        </>
      ) : null}
    </View>
  );
}

// ---------- Tela ----------
export default function MeusDados() {
  const navigation = useNavigation();

  const [carregando, setCarregando] = useState(true);
  const [dados, setDados] = useState({
    idoso: null,
    usuario: null,
    doencas: [],
    enderecos: [],
  });
  const [falhas, setFalhas] = useState({});

  // Toda vez que a tela ganha foco, atualiza (o idoso logado é descoberto na API)
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      (async () => {
        const resultado = await carregarMeusDados();

        if (ativo) {
          setDados(resultado.dados);
          setFalhas(resultado.falhas);
          setCarregando(false);
        }
      })();

      return () => {
        ativo = false;
      };
    }, []),
  );

  // Garante que o botão voltar do Android volte para a tela anterior
  useEffect(() => {
    const inscricao = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }

      return false;
    });

    return () => inscricao.remove();
  }, [navigation]);

  const voltar = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const { idoso, usuario, doencas } = dados;
  const enderecos = (dados.enderecos ?? []).map(normalizarEndereco);
  const nascimento = dataEIdade(usuario?.data_nascimento);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COR_FUNDO} barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
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
              color={COR_TEXTO}
            />
          </Pressable>

          <View style={styles.tituloContainer}>
            <Text style={styles.titulo} numberOfLines={2}>
              Meus dados
            </Text>

            <Text style={styles.subtitulo}>Informações do seu cadastro</Text>
          </View>
        </View>

        {carregando ? (
          <View accessible accessibilityLabel="Carregando seus dados">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonBloco key={i} style={styles.skeleton} />
            ))}
          </View>
        ) : (
          <>
            {/* Dados pessoais */}
            <Secao icone="account-outline" titulo="Dados pessoais">
              {falhas.usuario ? (
                <Text style={styles.aviso}>Não carregou</Text>
              ) : (
                <>
                  <Linha rotulo="Nome" valor={ou(usuario?.nome)} />
                  <Linha rotulo="CPF" valor={formatarCpf(usuario?.cpf)} />
                  <Linha rotulo="E-mail" valor={ou(usuario?.email)} />
                  <Linha
                    rotulo="Nascimento"
                    valor={
                      nascimento.idade !== null
                        ? `${nascimento.texto} (${nascimento.idade} anos)`
                        : nascimento.texto
                    }
                  />
                  <Linha
                    rotulo="Estado civil"
                    valor={capitalizar(usuario?.estado_civil)}
                  />
                </>
              )}
            </Secao>

            {/* Saúde e contato */}
            <Secao icone="heart-outline" titulo="Saúde e contato">
              {falhas.idoso ? (
                <Text style={styles.aviso}>Não carregou</Text>
              ) : (
                <>
                  <Linha
                    rotulo="Tipo sanguíneo"
                    valor={ou(idoso?.tipo_sanguineo)}
                  />
                  <Linha
                    rotulo="Telefone"
                    valor={formatarTelefone(idoso?.telefone)}
                  />
                  <Linha
                    rotulo="Pessoa com deficiência"
                    valor={
                      vazio(idoso?.pcd)
                        ? '—'
                        : String(idoso.pcd).toLowerCase() === 'sim'
                          ? 'Sim'
                          : 'Não'
                    }
                  />
                </>
              )}
            </Secao>

            {/* Doenças */}
            <Secao icone="clipboard-pulse-outline" titulo="Doenças">
              {falhas.doencas ? (
                <Text style={styles.aviso}>Não carregou</Text>
              ) : doencas.length === 0 ? (
                <Text style={styles.aviso}>Nenhuma doença cadastrada.</Text>
              ) : (
                doencas.map((d, i) => (
                  <View key={String(d?.id ?? i)} style={styles.itemDoenca}>
                    <MaterialCommunityIcons
                      name="circle-small"
                      size={28}
                      color={COR_TEXTO}
                    />

                    <Text style={styles.itemDoencaTexto}>
                      {nomeDaDoenca(d)}
                    </Text>
                  </View>
                ))
              )}
            </Secao>

            {/* Endereços (por último) */}
            <Secao
              icone="map-marker-outline"
              titulo={enderecos.length > 1 ? 'Endereços' : 'Endereço'}
            >
              {enderecos.length > 0 ? (
                enderecos.map((e, i) => (
                  <CartaoEndereco
                    key={String(e.id ?? `${e.cep}-${i}`)}
                    endereco={e}
                    posicao={i + 1}
                    total={enderecos.length}
                  />
                ))
              ) : (
                <Text style={styles.aviso}>Nenhum endereço cadastrado.</Text>
              )}
            </Secao>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COR_FUNDO,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 28,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  botaoHeader: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COR_BOTAO,
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
    color: COR_TEXTO,
  },

  subtitulo: {
    fontSize: 16,
    color: COR_TEXTO_SECUNDARIO,
    marginTop: 6,
  },

  skeleton: {
    height: 150,
    borderRadius: 24,
    marginBottom: 14,
    backgroundColor: COR_BORDA,
  },

  secao: {
    backgroundColor: COR_SUPERFICIE,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },

  secaoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },

  secaoTitulo: {
    flex: 1,
    color: COR_TEXTO,
    fontSize: 22,
    fontWeight: 'bold',
  },

  linha: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COR_BORDA,
  },

  linhaRotulo: {
    color: COR_TEXTO_SECUNDARIO,
    fontSize: 15,
  },

  linhaValor: {
    color: COR_TEXTO,
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 2,
  },

  aviso: {
    color: COR_TEXTO_SECUNDARIO,
    fontSize: 17,
    lineHeight: 24,
  },

  itemDoenca: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  itemDoencaTexto: {
    flex: 1,
    color: COR_TEXTO,
    fontSize: 19,
    fontWeight: 'bold',
    paddingVertical: 4,
  },

  enderecoCard: {
    borderWidth: 1,
    borderColor: COR_BORDA,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    marginBottom: 12,
  },

  enderecoCabeca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    marginBottom: 6,
  },

  enderecoTextos: {
    flex: 1,
  },

  enderecoTitulo: {
    color: COR_TEXTO,
    fontSize: 19,
    fontWeight: 'bold',
  },

  enderecoResumo: {
    color: COR_TEXTO_SECUNDARIO,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 2,
  },

  pressionado: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});