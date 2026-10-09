import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { cadastrarUsuario } from '../../services/api/api';
import {
  mascararCpf,
  validarNome,
  validarCpf,
  validarEmail,
  validarSenha,
  validarDataNascimento,
  validarEstadoCivil,
  formatarData,
  dataParaIso,
  dataMinima,
  REGRAS_SENHA,
  ESTADOS_CIVIS,
} from '../../utils/validacoes';

// Props: onCadastro(dados) é chamado depois que o usuário foi criado na API
// (dados = o que foi cadastrado, caso a próxima tela precise)
export default function Cadastro({ onCadastro }) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [dataNascimento, setDataNascimento] = useState(null); // Date ou null
  const [textoDataNascimento, setTextoDataNascimento] = useState('');
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [estadoCivil, setEstadoCivil] = useState(''); // valor, ex: 'solteiro'
  const [mostrarEstadoCivil, setMostrarEstadoCivil] = useState(false);

  const [erros, setErros] = useState({}); // { nome, cpf, email, senha, data, estadoCivil }
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(false);

  function definirErro(campo, mensagem) {
    setErros((atual) => ({ ...atual, [campo]: mensagem }));
  }

  // Valida um campo ao sair dele
  function aoSair(campo) {
    if (campo === 'nome') definirErro('nome', validarNome(nome));
    if (campo === 'cpf') definirErro('cpf', validarCpf(cpf));
    if (campo === 'email') definirErro('email', validarEmail(email));
    if (campo === 'senha') definirErro('senha', validarSenha(senha));
  }

  function formatarDigitacaoData(texto) {
    const numeros = texto.replace(/\D/g, '').slice(0, 8);

    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;

    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
  }

  function converterTextoParaData(texto) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) return null;

    const [dia, mes, ano] = texto.split('/').map(Number);
    const data = new Date(ano, mes - 1, dia);

    if (
      data.getFullYear() !== ano ||
      data.getMonth() !== mes - 1 ||
      data.getDate() !== dia
    ) {
      return null;
    }

    return data;
  }

  function aoMudarDataDigitada(texto) {
    const textoFormatado = formatarDigitacaoData(texto);
    const dataConvertida = converterTextoParaData(textoFormatado);

    setTextoDataNascimento(textoFormatado);
    setDataNascimento(dataConvertida);

    if (erros.data) definirErro('data', '');
  }

  function aoSairData() {
    const dataConvertida = converterTextoParaData(textoDataNascimento);
    setDataNascimento(dataConvertida);

    if (textoDataNascimento && !dataConvertida) {
      definirErro('data', 'Digite uma data válida no formato dd/mm/aaaa.');
      return;
    }

    definirErro('data', validarDataNascimento(dataConvertida));
  }

  function aoMudarCalendario(evento, selecionada) {
    if (!selecionada) return;

    if (Platform.OS === 'android') {
      setMostrarCalendario(false);
    }

    setDataNascimento(selecionada);
    setTextoDataNascimento(formatarData(selecionada));
    definirErro('data', validarDataNascimento(selecionada));
  }

  function aoFecharCalendario() {
    if (Platform.OS === 'android') {
      setMostrarCalendario(false);
    }
  }

  function selecionarEstadoCivil(valor) {
    setEstadoCivil(valor);
    definirErro('estadoCivil', '');
    setMostrarEstadoCivil(false);
  }

  const textoEstadoCivil =
    ESTADOS_CIVIS.find((e) => e.valor === estadoCivil)?.texto ?? '';

  async function proximo() {
    if (carregando) return;

    const dataNascimentoFinal = converterTextoParaData(textoDataNascimento);
    const erroData = textoDataNascimento && !dataNascimentoFinal
      ? 'Digite uma data válida no formato dd/mm/aaaa.'
      : validarDataNascimento(dataNascimentoFinal);

    const novosErros = {
      nome: validarNome(nome),
      cpf: validarCpf(cpf),
      email: validarEmail(email),
      senha: validarSenha(senha),
      data: erroData,
      estadoCivil: validarEstadoCivil(estadoCivil),
    };
    setErros(novosErros);
    setErroGeral('');
    if (Object.values(novosErros).some(Boolean)) return;

    setCarregando(true);
    try {
      const dados = {
        nome: nome.trim(),
        cpf,
        email: email.trim().toLowerCase(),
        senha,
        dataNascimento: dataParaIso(dataNascimentoFinal),
        estadoCivil,
      };
      await cadastrarUsuario(dados);
      onCadastro?.(dados);
    } catch (e) {
      // 409 = conflito (e-mail ou CPF já existem na base)
      if (String(e.message).includes('409')) {
        setErroGeral('Já existe uma conta com esse e-mail ou CPF');
      } else {
        setErroGeral(e.message);
      }
    } finally {
      setCarregando(false);
    }
  }

  const mostrarRegrasSenha = senha.length > 0 || !!erros.senha;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.titulo}>Criar conta</Text>

          <Text style={styles.label}>Nome Completo:</Text>
          <TextInput
            style={[styles.input, erros.nome && styles.inputErro]}
            value={nome}
            onChangeText={(t) => {
              setNome(t);
              if (erros.nome) definirErro('nome', '');
            }}
            onBlur={() => aoSair('nome')}
            autoCapitalize="words"
            editable={!carregando}
          />
          {erros.nome ? <Text style={styles.erro}>{erros.nome}</Text> : null}

          <Text style={styles.label}>Cpf:</Text>
          <TextInput
            style={[styles.input, erros.cpf && styles.inputErro]}
            value={cpf}
            onChangeText={(t) => {
              setCpf(mascararCpf(t));
              if (erros.cpf) definirErro('cpf', '');
            }}
            onBlur={() => aoSair('cpf')}
            keyboardType="numeric"
            maxLength={14}
            editable={!carregando}
          />
          {erros.cpf ? <Text style={styles.erro}>{erros.cpf}</Text> : null}

          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={[styles.input, erros.email && styles.inputErro]}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (erros.email) definirErro('email', '');
            }}
            onBlur={() => aoSair('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!carregando}
          />
          {erros.email ? <Text style={styles.erro}>{erros.email}</Text> : null}

          <Text style={styles.label}>Senha:</Text>
          <View style={[styles.campoSenha, erros.senha && styles.inputErro]}>
            <TextInput
              style={styles.inputSenha}
              value={senha}
              onChangeText={(t) => {
                setSenha(t);
                if (erros.senha) definirErro('senha', '');
              }}
              onBlur={() => aoSair('senha')}
              secureTextEntry={!mostrarSenha}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!carregando}
            />
            <Pressable
              onPress={() => setMostrarSenha((v) => !v)}
              hitSlop={10}
              style={styles.olho}
            >
              <Ionicons
                name={mostrarSenha ? 'eye-outline' : 'eye-off-outline'}
                size={24}
                color="#000"
              />
            </Pressable>
          </View>

          {mostrarRegrasSenha ? (
            <View style={styles.regras}>
              {REGRAS_SENHA.map((regra) => {
                const ok = regra.ok(senha);
                return (
                  <View key={regra.id} style={styles.regra}>
                    <Ionicons
                      name={ok ? 'checkmark-circle' : 'ellipse-outline'}
                      size={16}
                      color={ok ? '#1b7a2f' : '#777'}
                    />
                    <Text style={[styles.regraTexto, ok && styles.regraOk]}>{regra.texto}</Text>
                  </View>
                );
              })}
            </View>
          ) : null}

          <Text style={styles.label}>Estado civil:</Text>
          <Pressable
            style={[styles.input, styles.seletor, erros.estadoCivil && styles.inputErro]}
            onPress={() => !carregando && setMostrarEstadoCivil(true)}
            disabled={carregando}
            accessibilityRole="button"
            accessibilityLabel="Selecionar estado civil"
          >
            <Text style={[styles.seletorTexto, !estadoCivil && styles.seletorPlaceholder]}>
              {textoEstadoCivil || 'Selecione'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#000" />
          </Pressable>
          {erros.estadoCivil ? <Text style={styles.erro}>{erros.estadoCivil}</Text> : null}

          <Modal
            visible={mostrarEstadoCivil}
            transparent
            animationType="fade"
            onRequestClose={() => setMostrarEstadoCivil(false)}
          >
            <Pressable
              style={styles.modalFundo}
              onPress={() => setMostrarEstadoCivil(false)}
            >
              <Pressable style={styles.modalCaixa} onPress={() => {}}>
                <Text style={styles.modalTitulo}>Estado civil</Text>
                {ESTADOS_CIVIS.map((op) => {
                  const selecionado = op.valor === estadoCivil;
                  return (
                    <Pressable
                      key={op.valor}
                      style={[styles.opcao, selecionado && styles.opcaoSelecionada]}
                      onPress={() => selecionarEstadoCivil(op.valor)}
                      accessibilityRole="button"
                    >
                      <Text style={styles.opcaoTexto}>{op.texto}</Text>
                      {selecionado ? (
                        <Ionicons name="checkmark" size={20} color="#1b7a2f" />
                      ) : null}
                    </Pressable>
                  );
                })}
              </Pressable>
            </Pressable>
          </Modal>

          <View style={styles.campoData}>
            <Text style={styles.labelData}>Data de nascimento:</Text>
            <View style={styles.linhaData}>
              <TextInput
                style={[styles.inputDataCampo, erros.data && styles.inputErro]}
                value={textoDataNascimento}
                onChangeText={aoMudarDataDigitada}
                onBlur={aoSairData}
                placeholder="dd/mm/aaaa"
                keyboardType="numeric"
                maxLength={10}
                editable={!carregando}
                accessibilityLabel="Digitar data de nascimento"
              />
              <Pressable
                style={[styles.botaoCalendario, erros.data && styles.inputErro]}
                onPress={() => !carregando && setMostrarCalendario(true)}
                accessibilityRole="button"
                accessibilityLabel="Escolher data de nascimento no calendário"
                disabled={carregando}
              >
                <Ionicons name="calendar-outline" size={18} color="#000" />
              </Pressable>
            </View>
          </View>
          {erros.data ? <Text style={styles.erro}>{erros.data}</Text> : null}

          {mostrarCalendario ? (
            <View>
              <DateTimePicker
                value={dataNascimento ?? new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                minimumDate={dataMinima()}
                onValueChange={aoMudarCalendario}
                onDismiss={aoFecharCalendario}
              />
              {Platform.OS === 'ios' ? (
                <Pressable
                  style={styles.botaoConfirmarData}
                  onPress={() => {
                    if (!dataNascimento) {
                      const padrao = new Date(2000, 0, 1);
                      setDataNascimento(padrao);
                      setTextoDataNascimento(formatarData(padrao));
                      definirErro('data', validarDataNascimento(padrao));
                    }
                    setMostrarCalendario(false);
                  }}
                >
                  <Text style={styles.botaoConfirmarDataTexto}>Confirmar data</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {erroGeral ? <Text style={styles.erroGeral}>{erroGeral}</Text> : null}

          <Pressable
            style={[styles.botao, carregando && styles.botaoDesabilitado]}
            onPress={proximo}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.botaoTexto}>Próximo</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF1FF',
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 24,
  },

  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 12,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
    marginBottom: 6,
  },

  input: {
    backgroundColor: '#E1EAF1',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000',
  },

  inputErro: {
    borderColor: '#b00020',
  },

  campoSenha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E1EAF1',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
  },

  inputSenha: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000',
  },

  olho: {
    paddingHorizontal: 10,
  },

  regras: {
    marginTop: 8,
    gap: 4,
  },

  regra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  regraTexto: {
    fontSize: 13,
    color: '#555',
  },

  regraOk: {
    color: '#1b7a2f',
  },

  campoData: {
    marginTop: 16,
  },

  linhaData: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  labelData: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
  },

  inputDataCampo: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#E1EAF1',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },

  botaoCalendario: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E1EAF1',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },

  botaoConfirmarData: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  botaoConfirmarDataTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textDecorationLine: 'underline',
  },

  // Seletor de estado civil
  seletor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  seletorTexto: {
    fontSize: 16,
    color: '#000',
  },

  seletorPlaceholder: {
    color: '#777',
  },

  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },

  modalCaixa: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },

  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 8,
  },

  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  opcaoSelecionada: {
    backgroundColor: '#E1EAF1',
  },

  opcaoTexto: {
    fontSize: 16,
    color: '#000',
  },

  erro: {
    color: '#b00020',
    fontSize: 13,
    marginTop: 4,
  },

  erroGeral: {
    color: '#b00020',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },

  botao: {
    backgroundColor: '#FFE566',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 40,
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  botaoTexto: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});