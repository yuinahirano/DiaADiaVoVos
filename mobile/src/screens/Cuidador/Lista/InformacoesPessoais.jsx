import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AlertaModal, { CORES_ALERTA } from '../../../components/AlertaModal';
import FormularioModal from '../../../components/FormularioModal';
import { SkeletonBloco } from '../../../components/Skeleton';
import { useTema } from '../../../contexts/TemaContext';
import { useIdosoSelecionado } from '../../../contexts/IdosoSelecionadoContext';
import {
  apagarEndereco,
  cadastrarEndereco,
  editarEndereco,
  extrairEndereco,
  listarEnderecosDoIdoso,
} from '../../../services/api/apiCuidador';

// Ícone do botão de editar
const ICONE_EDITAR = 'pencil-outline';

// Ícone e cor do botão de apagar
const ICONE_APAGAR = 'trash-can-outline';
const COR_APAGAR = '#C62828';

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

// Máscara do CEP enquanto digita: 00000-000
function mascararCep(texto) {
  const d = soDigitos(texto).slice(0, 8);

  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

// "1995-06-15T03:00:00.000Z" -> { texto: "15/06/1995", idade: 31 }
// Usa só a parte da data do texto, para o fuso não mudar o dia
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

// Padroniza o endereço, não importa o nome dos campos da API:
// - aceita o CEP em vários nomes de campo (ou dentro de um objeto aninhado)
// - devolve o CEP com 8 dígitos: se o banco guardou como número, os zeros da
//   esquerda se perdem (ex.: 01310100 vira 1310100), então completa com zeros
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

// ---------- Formulário de endereço ----------
const CAMPOS_ENDERECO = [
  {
    chave: 'nome',
    rotulo: 'Nome do endereço (opcional)',
    placeholder: 'Casa do meu filho',
    maxLength: 60,
  },
  {
    chave: 'cep',
    rotulo: 'CEP',
    placeholder: '00000-000',
    teclado: 'number-pad',
    maxLength: 9,
  },
  {
    chave: 'numero',
    rotulo: 'Número (0000 se não tiver)',
    placeholder: '123 ou 0000',
    teclado: 'number-pad',
    maxLength: 8,
  },
  {
    chave: 'complemento',
    rotulo: 'Complemento (opcional)',
    placeholder: 'Torre, bloco ou apartamento',
    maxLength: 60,
  },
];

const FORM_VAZIO = { nome: '', cep: '', numero: '', complemento: '' };

// Linha "rótulo: valor" dentro dos cartões
function Linha({ styles, rotulo, valor }) {
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
function Secao({ styles, cores, icone, titulo, children }) {
  return (
    <View style={styles.secao}>
      <View style={styles.secaoTopo}>
        <MaterialCommunityIcons name={icone} size={28} color={cores.texto} />

        <Text style={styles.secaoTitulo}>{titulo}</Text>
      </View>

      {children}
    </View>
  );
}

// Resumo do endereço, mostrado com o cartão fechado
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

// Um endereço da seção "Endereços".
// Fechado mostra nome e resumo; ao tocar, abre todos os detalhes.
function CartaoEndereco({
  styles,
  cores,
  endereco,
  posicao,
  total,
  onEditar,
  onApagar,
}) {
  const [aberto, setAberto] = useState(false);

  const titulo = !vazio(endereco.nome)
    ? String(endereco.nome)
    : total > 1
      ? `Endereço ${posicao}`
      : 'Endereço';

  return (
    <View style={styles.enderecoCard}>
      <View style={[styles.enderecoTopo, aberto && styles.enderecoTopoAberto]}>
        <Pressable
          style={({ pressed }) => [
            styles.enderecoCabeca,
            pressed && styles.botaoPressionado,
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
            size={30}
            color={cores.texto}
          />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.botaoIconeEditar,
            pressed && styles.botaoPressionado,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Editar ${titulo}`}
          onPress={onEditar}
        >
          <MaterialCommunityIcons
            name={ICONE_EDITAR}
            size={24}
            color={cores.texto}
          />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.botaoIconeEditar,
            pressed && styles.botaoPressionado,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Apagar ${titulo}`}
          onPress={onApagar}
        >
          <MaterialCommunityIcons
            name={ICONE_APAGAR}
            size={24}
            color={COR_APAGAR}
          />
        </Pressable>
      </View>

      {aberto ? (
        <>
          <Linha
            styles={styles}
            rotulo="Logradouro"
            valor={ou(endereco.logradouro)}
          />
          <Linha
            styles={styles}
            rotulo="Número"
            valor={textoNumero(endereco.numero)}
          />
          <Linha
            styles={styles}
            rotulo="Complemento"
            valor={ou(endereco.complemento)}
          />
          <Linha styles={styles} rotulo="Bairro" valor={ou(endereco.bairro)} />
          <Linha styles={styles} rotulo="Cidade" valor={ou(endereco.cidade)} />
          <Linha styles={styles} rotulo="UF" valor={ou(endereco.uf)} />
          <Linha
            styles={styles}
            rotulo="CEP"
            valor={formatarCep(endereco.cep)}
          />
        </>
      ) : null}
    </View>
  );
}

// Dados pessoais e endereços do idoso, usado dentro da tela PerfilIdoso.
// "usuario" e "falhou" vêm do PerfilIdoso; os endereços são buscados aqui.
// O conteúdo de "children" aparece entre os dados pessoais e os endereços.
export default function InformacoesPessoais({ usuario, falhou, children }) {
  const { cores } = useTema();
  const { idosoSelecionado } = useIdosoSelecionado();

  const styles = useMemo(() => criarStyles(cores), [cores]);

  const idUsuario = idosoSelecionado?.id_usuario;
  const nomeIdoso = usuario?.nome ?? idosoSelecionado?.nome ?? 'Idoso';

  const [carregando, setCarregando] = useState(true);
  const [enderecosApi, setEnderecosApi] = useState([]);

  // Endereços salvos ou editados nesta tela (valem até a API listar de novo)
  const [enderecosLocais, setEnderecosLocais] = useState([]);

  // Formulário de endereço
  const [formAberto, setFormAberto] = useState(false);
  const [modoForm, setModoForm] = useState('criar'); // 'criar' | 'editar'
  const [enderecoAlvo, setEnderecoAlvo] = useState(null); // endereço sendo editado
  const [valoresForm, setValoresForm] = useState(FORM_VAZIO);
  const [errosForm, setErrosForm] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [sucessoAberto, setSucessoAberto] = useState(false);

  // Apagar endereço
  const [enderecoParaApagar, setEnderecoParaApagar] = useState(null);
  const [apagando, setApagando] = useState(false);
  const [erroApagar, setErroApagar] = useState('');

  // Busca os endereços do idoso; se a listagem falhar, devolve lista vazia
  const buscarEnderecos = useCallback(async () => {
    if (!idUsuario) {
      return [];
    }

    try {
      const lista = await listarEnderecosDoIdoso(idUsuario);

      return (lista ?? []).map(normalizarEndereco);
    } catch {
      return [];
    }
  }, [idUsuario]);

  // Atualiza sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      (async () => {
        const lista = await buscarEnderecos();

        if (ativo) {
          setEnderecosApi(lista);

          // Se a API lista os endereços, a lista dela passa a valer
          if (lista.length) {
            setEnderecosLocais([]);
          }

          setCarregando(false);
        }
      })();

      return () => {
        ativo = false;
      };
    }, [buscarEnderecos]),
  );

  // Ao trocar de idoso, descarta os endereços locais do anterior
  useEffect(() => {
    setEnderecosLocais([]);
  }, [idUsuario]);

  // Todos os endereços: os da API, com os salvos agora por cima (mesmo id)
  const enderecos = useMemo(() => {
    const base = [...enderecosApi];

    enderecosLocais.forEach((local) => {
      const i =
        local.id !== null && local.id !== undefined
          ? base.findIndex((b) => b.id === local.id)
          : -1;

      if (i >= 0) {
        base[i] = local;
      } else {
        base.push(local);
      }
    });

    return base;
  }, [enderecosApi, enderecosLocais]);

  // ---------- Formulário de endereço ----------
  // alvo = endereço que será editado (só no modo 'editar')
  const abrirForm = (modo, alvo = null) => {
    setModoForm(modo);
    setEnderecoAlvo(modo === 'editar' ? alvo : null);
    setErrosForm({});

    if (modo === 'editar' && alvo) {
      setValoresForm({
        nome: alvo.nome ?? '',
        cep: mascararCep(alvo.cep),
        numero: semNumero(alvo.numero) ? '0000' : String(alvo.numero),
        complemento: alvo.complemento ?? '',
      });
    } else {
      setValoresForm(FORM_VAZIO);
    }

    setFormAberto(true);
  };

  const fecharForm = () => {
    if (!enviando) {
      setFormAberto(false);
    }
  };

  const mudarCampo = (chave, texto) => {
    const novo = chave === 'cep' ? mascararCep(texto) : texto;

    setValoresForm((v) => ({ ...v, [chave]: novo }));
    setErrosForm((e) => ({ ...e, [chave]: undefined }));
  };

  const validarForm = () => {
    const novos = {};

    if (soDigitos(valoresForm.cep).length !== 8) {
      novos.cep = 'Digite o CEP com 8 números.';
    }

    // Aceita 0000 (sem número), só não pode ficar vazio
    if (!soDigitos(valoresForm.numero)) {
      novos.numero = 'Digite o número ou 0000 se não tiver.';
    }

    setErrosForm(novos);

    return Object.keys(novos).length === 0;
  };

  const enviarEndereco = async () => {
    if (enviando || !validarForm()) {
      return;
    }

    if (!idUsuario) {
      setErrosForm({ cep: 'Não achei o id do usuário deste idoso.' });
      return;
    }

    const alvo = enderecoAlvo;

    if (modoForm === 'editar' && !alvo?.id) {
      setErrosForm({
        cep: 'Não achei o id deste endereço para editar.',
      });
      return;
    }

    const cep = soDigitos(valoresForm.cep);

    const corpo = {
      nome: valoresForm.nome,
      numero: valoresForm.numero,
      complemento: valoresForm.complemento,
      cep,
      idUsuario,
    };

    setEnviando(true);

    try {
      const resposta =
        modoForm === 'editar'
          ? await editarEndereco(alvo.id, corpo)
          : await cadastrarEndereco(corpo);

      // Se o CEP não mudou, mantém rua, bairro etc. que já estavam na tela
      const mesmoCep = modoForm === 'editar' && alvo?.cep === cep;

      const salvo = normalizarEndereco({
        ...(mesmoCep ? alvo : {}),
        id: modoForm === 'editar' ? alvo.id : undefined,
        cep,
        numero: String(Number(soDigitos(valoresForm.numero))),
        complemento: valoresForm.complemento.trim(),
        nome: valoresForm.nome.trim(),
        ...(extrairEndereco(resposta) ?? {}),
      });

      setEnderecosLocais((prev) => {
        const i =
          salvo.id !== null && salvo.id !== undefined
            ? prev.findIndex((p) => p.id === salvo.id)
            : -1;

        if (i >= 0) {
          return prev.map((p, idx) => (idx === i ? salvo : p));
        }

        return [...prev, salvo];
      });

      setFormAberto(false);
      // Espera o 1º Modal fechar antes de abrir o 2º (problema no iOS)
      setTimeout(() => setSucessoAberto(true), 250);

      // Atualiza em silêncio: se a API listar endereços, a lista dela passa a valer
      buscarEnderecos().then((lista) => {
        setEnderecosApi((prev) => (lista.length ? lista : prev));

        if (lista.length) {
          setEnderecosLocais([]);
        }
      });
    } catch (e) {
      // Sessão expirada: o app já está indo para o login
      if (!e?.sessaoExpirada) {
        setErrosForm({
          cep: e?.message || 'Não foi possível salvar o endereço.',
        });
      }
    } finally {
      setEnviando(false);
    }
  };

  // ---------- Apagar endereço ----------
  const pedirApagar = (endereco) => {
    setErroApagar('');
    setEnderecoParaApagar(endereco);
  };

  const cancelarApagar = () => {
    if (!apagando) {
      setEnderecoParaApagar(null);
    }
  };

  const confirmarApagar = async () => {
    const alvo = enderecoParaApagar;

    if (apagando || !alvo) {
      return;
    }

    if (!alvo.id) {
      setErroApagar('Não achei o id deste endereço para apagar.');
      return;
    }

    setApagando(true);
    setErroApagar('');

    try {
      await apagarEndereco(alvo.id);

      // Tira da tela na hora, sem esperar a API listar de novo
      setEnderecosApi((prev) => prev.filter((e) => e.id !== alvo.id));
      setEnderecosLocais((prev) => prev.filter((e) => e.id !== alvo.id));
      setEnderecoParaApagar(null);
    } catch (e) {
      // Sessão expirada: o app já está indo para o login
      if (!e?.sessaoExpirada) {
        setErroApagar(e?.message || 'Não foi possível apagar o endereço.');
      }
    } finally {
      setApagando(false);
    }
  };

  const nascimento = dataEIdade(usuario?.data_nascimento);
  const temEndereco = enderecos.length > 0;

  return (
    <>
      {/* Dados pessoais (tabela usuario) */}
      <Secao
        styles={styles}
        cores={cores}
        icone="account-outline"
        titulo="Dados pessoais"
      >
        {falhou ? (
          <Text style={styles.aviso}>Não carregou</Text>
        ) : (
          <>
            <Linha styles={styles} rotulo="Nome" valor={ou(usuario?.nome)} />
            <Linha
              styles={styles}
              rotulo="CPF"
              valor={formatarCpf(usuario?.cpf)}
            />
            <Linha styles={styles} rotulo="E-mail" valor={ou(usuario?.email)} />
            <Linha
              styles={styles}
              rotulo="Nascimento"
              valor={
                nascimento.idade !== null
                  ? `${nascimento.texto} (${nascimento.idade} anos)`
                  : nascimento.texto
              }
            />
            <Linha
              styles={styles}
              rotulo="Estado civil"
              valor={capitalizar(usuario?.estado_civil)}
            />
          </>
        )}
      </Secao>

      {children}

      {/* Endereços (todos os cadastrados) */}
      {carregando ? (
        <View accessible accessibilityLabel="Carregando endereços">
          <SkeletonBloco style={styles.skeleton} />
        </View>
      ) : (
        <Secao
          styles={styles}
          cores={cores}
          icone="map-marker-outline"
          titulo={enderecos.length > 1 ? 'Endereços' : 'Endereço'}
        >
          {temEndereco ? (
            enderecos.map((e, i) => (
              <CartaoEndereco
                key={String(e.id ?? `${e.cep}-${i}`)}
                styles={styles}
                cores={cores}
                endereco={e}
                posicao={i + 1}
                total={enderecos.length}
                onEditar={() => abrirForm('editar', e)}
                onApagar={() => pedirApagar(e)}
              />
            ))
          ) : (
            <Text style={styles.aviso}>Nenhum endereço cadastrado.</Text>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.botaoEndereco,
              pressed && styles.botaoPressionado,
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              temEndereco
                ? 'Adicionar outro endereço do idoso'
                : 'Cadastrar endereço do idoso'
            }
            onPress={() => abrirForm('criar')}
          >
            <MaterialCommunityIcons
              name="map-marker-plus-outline"
              size={26}
              color="#FFFFFF"
            />

            <Text style={styles.botaoEnderecoTexto}>
              {temEndereco ? 'Adicionar endereço' : 'Cadastrar endereço'}
            </Text>
          </Pressable>
        </Secao>
      )}

      <FormularioModal
        visivel={formAberto}
        icone={
          modoForm === 'editar' ? ICONE_EDITAR : 'map-marker-plus-outline'
        }
        titulo={modoForm === 'editar' ? 'Editar endereço' : 'Cadastrar endereço'}
        campos={CAMPOS_ENDERECO}
        valores={valoresForm}
        erros={errosForm}
        salvando={enviando}
        textoConfirmar={
          modoForm === 'editar' ? 'Salvar alterações' : 'Salvar endereço'
        }
        aoMudar={mudarCampo}
        aoConfirmar={enviarEndereco}
        aoCancelar={fecharForm}
      />

      <AlertaModal
        visivel={sucessoAberto}
        icone="check-circle-outline"
        corIcone={CORES_ALERTA.azul}
        titulo={modoForm === 'editar' ? 'Endereço atualizado' : 'Endereço salvo'}
        mensagem={
          modoForm === 'editar'
            ? `O endereço de ${nomeIdoso} foi atualizado.`
            : `O endereço de ${nomeIdoso} foi cadastrado.`
        }
        botoes={[
          {
            texto: 'Ok',
            estilo: 'neutro',
            onPress: () => setSucessoAberto(false),
          },
        ]}
        aoFechar={() => setSucessoAberto(false)}
      />

      {/* Confirmação antes de apagar o endereço */}
      <AlertaModal
        visivel={!!enderecoParaApagar}
        icone={ICONE_APAGAR}
        corIcone={COR_APAGAR}
        titulo="Apagar endereço"
        mensagem={
          erroApagar ||
          `Deseja apagar ${
            !vazio(enderecoParaApagar?.nome)
              ? enderecoParaApagar.nome
              : 'este endereço'
          } de ${nomeIdoso}? Essa ação não pode ser desfeita.`
        }
        botoes={[
          {
            texto: 'Cancelar',
            estilo: 'neutro',
            onPress: cancelarApagar,
          },
          {
            texto: apagando ? 'Apagando...' : 'Apagar',
            estilo: 'perigo',
            onPress: confirmarApagar,
          },
        ]}
        aoFechar={cancelarApagar}
      />
    </>
  );
}

const criarStyles = (cores) =>
  StyleSheet.create({
    skeleton: {
      height: 150,
      borderRadius: 24,
      marginBottom: 14,
      backgroundColor: cores.skeleton,
    },

    secao: {
      backgroundColor: cores.superficie,
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
      color: cores.texto,
      fontSize: 22,
      fontWeight: 'bold',
    },

    linha: {
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: cores.borda,
    },

    linhaRotulo: {
      color: cores.textoSecundario,
      fontSize: 15,
    },

    linhaValor: {
      color: cores.texto,
      fontSize: 19,
      fontWeight: 'bold',
      marginTop: 2,
    },

    aviso: {
      color: cores.textoSecundario,
      fontSize: 17,
      lineHeight: 24,
    },

    enderecoCard: {
      borderWidth: 1,
      borderColor: cores.borda,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 6,
      marginBottom: 12,
    },

    enderecoTopo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    enderecoTopoAberto: {
      marginBottom: 6,
    },

    enderecoCabeca: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minHeight: 44,
    },

    enderecoTextos: {
      flex: 1,
    },

    enderecoTitulo: {
      color: cores.texto,
      fontSize: 19,
      fontWeight: 'bold',
    },

    enderecoResumo: {
      color: cores.textoSecundario,
      fontSize: 16,
      lineHeight: 22,
      marginTop: 2,
    },

    botaoIconeEditar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: cores.botaoHeader,
      alignItems: 'center',
      justifyContent: 'center',
    },

    botaoEndereco: {
      minHeight: 58,
      flexDirection: 'row',
      gap: 10,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: CORES_ALERTA.azul,
      marginTop: 4,
    },

    botaoPressionado: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },

    botaoEnderecoTexto: {
      color: '#FFFFFF',
      fontSize: 19,
      fontWeight: 'bold',
    },
  });