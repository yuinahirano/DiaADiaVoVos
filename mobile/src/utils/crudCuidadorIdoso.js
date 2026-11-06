import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CORES_ALERTA } from '../components/AlertaModal';
import {
  criarRegistro,
  editarRegistro,
  excluirRegistro,
  marcarConsultaCompareceu,
} from '../services/api/apiCuidador';

// Tudo que consultas, medicamentos e doenças usam em comum:
// máscaras/validações, o card com Editar/Excluir e a lógica do CUD.

// ---------- Máscaras e conversões (formulário usa DD/MM/AAAA e HH:MM) ----------

function mascaraData(texto) {
  const n = String(texto).replace(/\D/g, '').slice(0, 8);

  if (n.length <= 2) {
    return n;
  }

  if (n.length <= 4) {
    return `${n.slice(0, 2)}/${n.slice(2)}`;
  }

  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

function mascaraHora(texto) {
  const n = String(texto).replace(/\D/g, '').slice(0, 4);

  if (n.length <= 2) {
    return n;
  }

  return `${n.slice(0, 2)}:${n.slice(2)}`;
}

const MASCARAS = { data: mascaraData, hora: mascaraHora };

function dataValida(texto) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);

  if (!m) {
    return false;
  }

  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const ano = Number(m[3]);
  const d = new Date(ano, mes - 1, dia);

  return (
    ano >= 1900 &&
    d.getFullYear() === ano &&
    d.getMonth() === mes - 1 &&
    d.getDate() === dia
  );
}

function horaValida(texto) {
  const m = /^(\d{2}):(\d{2})$/.exec(texto);

  return !!m && Number(m[1]) <= 23 && Number(m[2]) <= 59;
}

// "2026-10-10" ou "2026-10-10T00:00:00.000Z" -> "10/10/2026"
export function isoParaCampo(valor) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(valor ?? ''));

  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

// "10/10/2026" -> "2026-10-10"
export function campoParaIso(texto) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);

  return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
}

// "08:00:00" ou "8:00" -> "08:00"
export function horaParaCampo(valor) {
  const m = /(\d{1,2}):(\d{2})/.exec(String(valor ?? ''));

  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : '';
}

function formularioVazio(config) {
  const vazio = {};

  config.campos.forEach((campo) => {
    vazio[campo.chave] = '';
  });

  return vazio;
}

// Devolve { chave: mensagem } com o que está errado (vazio = tudo certo)
function validar(config, valores) {
  const erros = {};

  config.campos.forEach((campo) => {
    const valor = String(valores[campo.chave] ?? '').trim();

    if (config.obrigatorios.includes(campo.chave) && !valor) {
      erros[campo.chave] = 'Preencha este campo.';
      return;
    }

    if (valor && campo.mascara === 'data' && !dataValida(valor)) {
      erros[campo.chave] = 'Data inválida. Use DD/MM/AAAA.';
    }

    if (valor && campo.mascara === 'hora' && !horaValida(valor)) {
      erros[campo.chave] = 'Horário inválido. Use HH:MM.';
    }
  });

  return erros;
}

// ---------- Card ----------

// Uma linha de informação dentro do card (some se não tiver texto)
export function Linha({ styles, icone, texto, forte }) {
  if (!texto) {
    return null;
  }

  return (
    <View style={styles.linha}>
      <MaterialCommunityIcons name={icone} size={18} color="#000000" />

      <Text style={[styles.linhaTexto, forte && styles.linhaTextoForte]}>
        {texto}
      </Text>
    </View>
  );
}

// Card colorido com os botões Editar e Excluir (usado pelos três tipos)
export function CardItem({
  styles,
  cor,
  icone,
  titulo,
  children,
  acaoExtra, // opcional: { texto, icone, onPress } (ex.: "Compareceu")
  onEditar,
  onExcluir,
}) {
  return (
    <View style={[styles.card, { backgroundColor: cor }]}>
      <View style={styles.cardTopo}>
        <View style={styles.cardIcone}>
          <MaterialCommunityIcons name={icone} size={34} color="#000000" />
        </View>

        <Text style={styles.cardTitulo}>{titulo}</Text>
      </View>

      <View style={styles.bloco}>{children}</View>

      {acaoExtra ? (
        <Pressable
          style={({ pressed }) => [
            styles.botaoAcao,
            styles.botaoAcaoLargo,
            pressed && styles.botaoPressionado,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${acaoExtra.texto}, ${titulo}`}
          onPress={acaoExtra.onPress}
        >
          <MaterialCommunityIcons
            name={acaoExtra.icone}
            size={22}
            color="#000000"
          />
          <Text style={styles.botaoAcaoTexto}>{acaoExtra.texto}</Text>
        </Pressable>
      ) : null}

      <View style={styles.acoesCard}>
        <Pressable
          style={({ pressed }) => [
            styles.botaoAcao,
            pressed && styles.botaoPressionado,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Editar ${titulo}`}
          onPress={onEditar}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={22}
            color="#000000"
          />
          <Text style={styles.botaoAcaoTexto}>Editar</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.botaoAcao,
            pressed && styles.botaoPressionado,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Excluir ${titulo}`}
          onPress={onExcluir}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={22}
            color="#000000"
          />
          <Text style={styles.botaoAcaoTexto}>Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------- Lógica do CUD ----------

// Dois Modals ao mesmo tempo dão problema no iOS: fecha um e abre o outro depois
const depoisDeFechar = (acao) => setTimeout(acao, 250);

// Adicionar, editar e excluir (formulário + AlertaModal) para qualquer tipo:
// o que muda vem de "config" (ver consultas.js, medicamentos.js e doencas.js).
// recarregar: atualiza a lista depois de salvar/excluir.
export function useCrudLista({ tipo, config, idosoSelecionado, recarregar }) {
  // Formulário de adicionar/editar
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState(null); // item em edição (null = novo)
  const [valores, setValores] = useState(() => formularioVazio(config));
  const [errosForm, setErrosForm] = useState({});
  const [salvando, setSalvando] = useState(false);

  // Confirmação de exclusão e avisos (sucesso/erro), todos pelo AlertaModal
  const [itemExcluir, setItemExcluir] = useState(null);
  const [itemCompareceu, setItemCompareceu] = useState(null); // só consultas
  const [aviso, setAviso] = useState(null);

  const fecharAviso = () => setAviso(null);

  const avisoSucesso = (texto) => ({
    icone: 'check-circle-outline',
    corIcone: CORES_ALERTA.azul,
    titulo: texto,
    mensagem: '',
    botoes: [{ texto: 'Ok', estilo: 'neutro', onPress: fecharAviso }],
  });

  const abrirNovo = () => {
    setEditando(null);
    setValores(formularioVazio(config));
    setErrosForm({});
    setFormAberto(true);
  };

  const abrirEditar = (item) => {
    setEditando(item);
    setValores({ ...formularioVazio(config), ...config.paraForm(item) });
    setErrosForm({});
    setFormAberto(true);
  };

  const fecharForm = () => {
    if (!salvando) {
      setFormAberto(false);
    }
  };

  const mudarCampo = (chave, texto) => {
    const campo = config.campos.find((c) => c.chave === chave);
    const mascara = campo?.mascara ? MASCARAS[campo.mascara] : null;

    setValores((atual) => ({
      ...atual,
      [chave]: mascara ? mascara(texto) : texto,
    }));

    if (errosForm[chave]) {
      setErrosForm((atual) => ({ ...atual, [chave]: undefined }));
    }
  };

  const reabrirForm = () => {
    setAviso(null);
    depoisDeFechar(() => setFormAberto(true));
  };

  const salvar = async () => {
    const novosErros = validar(config, valores);
    setErrosForm(novosErros);

    if (Object.keys(novosErros).length > 0) {
      return;
    }

    setSalvando(true);

    try {
      if (!idosoSelecionado) {
        throw new Error('Nenhum idoso selecionado');
      }

      if (config.exigeUsuario && !idosoSelecionado.id_usuario) {
        throw new Error('Id do usuário do idoso não informado');
      }

      const corpo = config.paraCorpo(valores, idosoSelecionado);

      if (editando) {
        await editarRegistro(tipo, editando.id, corpo);
      } else {
        await criarRegistro(tipo, corpo);
      }

      setFormAberto(false);

      depoisDeFechar(() =>
        setAviso(
          avisoSucesso(editando ? config.textoEditado : config.textoCriado),
        ),
      );

      recarregar();
    } catch (e) {
      setFormAberto(false);

      depoisDeFechar(() =>
        setAviso({
          icone: 'alert-circle-outline',
          corIcone: CORES_ALERTA.vermelho,
          titulo: 'Não foi possível salvar',
          mensagem: 'Verifique sua conexão e tente de novo.',
          botoes: [
            { texto: 'Tentar de novo', estilo: 'neutro', onPress: reabrirForm },
            { texto: 'Cancelar', estilo: 'neutro', onPress: fecharAviso },
          ],
        }),
      );
    } finally {
      setSalvando(false);
    }
  };

  const pedirExclusao = (item) => setItemExcluir(item);

  const cancelarExclusao = () => setItemExcluir(null);

  const confirmarExclusao = async () => {
    const item = itemExcluir;
    setItemExcluir(null);

    if (!item) {
      return;
    }

    try {
      await excluirRegistro(tipo, item.id);

      depoisDeFechar(() => setAviso(avisoSucesso(config.textoExcluido)));

      recarregar();
    } catch (e) {
      depoisDeFechar(() =>
        setAviso({
          icone: 'alert-circle-outline',
          corIcone: CORES_ALERTA.vermelho,
          titulo: 'Não foi possível excluir',
          mensagem: 'Verifique sua conexão e tente de novo.',
          botoes: [
            {
              texto: 'Tentar de novo',
              estilo: 'neutro',
              onPress: () => {
                setAviso(null);
                depoisDeFechar(() => setItemExcluir(item));
              },
            },
            { texto: 'Cancelar', estilo: 'neutro', onPress: fecharAviso },
          ],
        }),
      );
    }
  };

  // ---------- Compareceu (só consultas) ----------

  const pedirCompareceu = (item) => setItemCompareceu(item);

  const cancelarCompareceu = () => setItemCompareceu(null);

  const confirmarCompareceu = async () => {
    const item = itemCompareceu;
    setItemCompareceu(null);

    if (!item) {
      return;
    }

    try {
      await marcarConsultaCompareceu(item.id);

      depoisDeFechar(() =>
        setAviso(avisoSucesso('Consulta marcada como compareceu.')),
      );

      recarregar();
    } catch (e) {
      depoisDeFechar(() =>
        setAviso({
          icone: 'alert-circle-outline',
          corIcone: CORES_ALERTA.vermelho,
          titulo: 'Não foi possível atualizar',
          mensagem: 'Verifique sua conexão e tente de novo.',
          botoes: [
            {
              texto: 'Tentar de novo',
              estilo: 'neutro',
              onPress: () => {
                setAviso(null);
                depoisDeFechar(() => setItemCompareceu(item));
              },
            },
            { texto: 'Cancelar', estilo: 'neutro', onPress: fecharAviso },
          ],
        }),
      );
    }
  };

  return {
    formAberto,
    editando,
    valores,
    errosForm,
    salvando,
    itemExcluir,
    itemCompareceu,
    aviso,
    abrirNovo,
    abrirEditar,
    fecharForm,
    mudarCampo,
    salvar,
    pedirExclusao,
    cancelarExclusao,
    confirmarExclusao,
    pedirCompareceu,
    cancelarCompareceu,
    confirmarCompareceu,
    fecharAviso,
  };
}