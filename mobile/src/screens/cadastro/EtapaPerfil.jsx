import React, { useState } from "react";

import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";

import { cadastrarIdoso, cadastrarCuidador } from "../../services/api/api";

import { formatarTelefone, telefoneValido } from "../../utils/validacoes";

const IMAGEM_CUIDADOR = require("../../../assets/cuidador.png");

const IMAGEM_IDOSO = require("../../../assets/idoso.png");

const COR_DESTAQUE = "#FFE566";

const COR_BOTAO = "#FFEB60";

const TIPOS_SANGUINEOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function OpcaoPerfil({ titulo, imagem, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Sou ${titulo}`}
      style={({ pressed }) => [
        styles.opcaoPerfil,

        {
          backgroundColor:
            titulo === "Cuidador" || pressed ? COR_DESTAQUE : "#FFFFFF",
        },
      ]}
    >
      <Image
        source={imagem}
        style={styles.opcaoPerfilImagem}
        resizeMode="contain"
      />

      <Text style={styles.opcaoPerfilTexto}>{titulo}</Text>
    </Pressable>
  );
}

export function EscolherPerfil({ onEscolher, onSair }) {
  return (
    <View style={styles.telaEscolha}>
      <Text style={styles.tituloEscolha}>Qual o tipo de Usuário?</Text>

      <View style={styles.opcoesPerfil}>
        <OpcaoPerfil
          titulo="Cuidador"
          imagem={IMAGEM_CUIDADOR}
          onPress={() => onEscolher("cuidador")}
        />

        <OpcaoPerfil
          titulo="Idoso"
          imagem={IMAGEM_IDOSO}
          onPress={() => onEscolher("idoso")}
        />
      </View>

      {onSair ? (
        <Pressable
          onPress={onSair}
          accessibilityRole="button"
          style={styles.link}
        >
          <Text style={styles.linkTexto}>Sair da conta</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function MolduraFormulario({ titulo, children }) {
  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cartao}>
          <Text style={styles.titulo}>{titulo}</Text>

          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function BotaoConcluir({ carregando, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={carregando}
      accessibilityRole="button"
      style={[styles.botao, carregando && styles.botaoDesativado]}
    >
      {carregando ? (
        <ActivityIndicator color="#000000" />
      ) : (
        <Text style={styles.botaoTexto}>Concluir Cadastro</Text>
      )}
    </Pressable>
  );
}

function LinkVoltar({ onVoltar }) {
  if (!onVoltar) return null;

  return (
    <Pressable
      onPress={onVoltar}
      accessibilityRole="button"
      style={styles.link}
    >
      <Text style={styles.linkTexto}>Voltar</Text>
    </Pressable>
  );
}

export function DadosIdoso({ onConcluido, onVoltar }) {
  const [tipoSanguineo, setTipoSanguineo] = useState("A+");

  const [telefone, setTelefone] = useState("");

  const [ehPcd, setEhPcd] = useState(false);

  const [carregando, setCarregando] = useState(false);

  const concluir = async () => {
    if (!telefoneValido(telefone)) {
      Alert.alert(
        "Telefone inválido",
        "Digite o DDD e o número, por exemplo (19) 99999-0000.",
      );

      return;
    }

    setCarregando(true);

    try {
      await cadastrarIdoso({ tipoSanguineo, telefone, pcd: ehPcd });

      await onConcluido();
    } catch (e) {
      setCarregando(false);

      Alert.alert(
        "Não foi possível concluir",
        e?.message || "Tente novamente em instantes.",
      );
    }
  };

  return (
    <MolduraFormulario titulo="Insira seus dados pessoais:">
      <Text style={styles.rotulo}>🩸 Tipo Sanguíneo</Text>

      <View style={styles.tipos}>
        {TIPOS_SANGUINEOS.map((tipo) => {
          const selecionado = tipo === tipoSanguineo;

          return (
            <Pressable
              key={tipo}
              onPress={() => setTipoSanguineo(tipo)}
              accessibilityRole="button"
              accessibilityState={{ selected: selecionado }}
              style={[styles.tipo, selecionado && styles.selecionado]}
            >
              <Text style={styles.tipoTexto}>{tipo}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.rotulo}>📞 Telefone</Text>

      <TextInput
        style={styles.campo}
        placeholder="( ) ____ - ____"
        placeholderTextColor="#888888"
        keyboardType="phone-pad"
        value={telefone}
        onChangeText={(texto) => setTelefone(formatarTelefone(texto))}
        maxLength={15}
      />

      <Text style={styles.rotulo}>É pcd?</Text>

      <View style={styles.linha}>
        <Pressable
          onPress={() => setEhPcd(true)}
          accessibilityRole="radio"
          accessibilityState={{ selected: ehPcd }}
          style={[styles.opcao, ehPcd && styles.selecionado]}
        >
          <Text style={styles.opcaoTexto}>Sim</Text>
        </Pressable>

        <Pressable
          onPress={() => setEhPcd(false)}
          accessibilityRole="radio"
          accessibilityState={{ selected: !ehPcd }}
          style={[styles.opcao, !ehPcd && styles.selecionado]}
        >
          <Text style={styles.opcaoTexto}>Não</Text>
        </Pressable>
      </View>

      <BotaoConcluir carregando={carregando} onPress={concluir} />

      <LinkVoltar onVoltar={onVoltar} />
    </MolduraFormulario>
  );
}

export function DadosCuidador({ onConcluido, onVoltar }) {
  const [telefone, setTelefone] = useState("");

  const [carregando, setCarregando] = useState(false);

  const concluir = async () => {
    if (!telefoneValido(telefone)) {
      Alert.alert(
        "Telefone inválido",
        "Digite o DDD e o número, por exemplo (19) 99999-0000.",
      );

      return;
    }

    setCarregando(true);

    try {
      await cadastrarCuidador({ telefone });

      await onConcluido();
    } catch (e) {
      setCarregando(false);

      Alert.alert(
        "Não foi possível concluir",
        e?.message || "Tente novamente em instantes.",
      );
    }
  };

  return (
    <MolduraFormulario titulo="Insira seu número de telefone">
      <Text style={styles.rotulo}>📞 Telefone</Text>

      <TextInput
        style={styles.campo}
        placeholder="( ) ____ - ____"
        placeholderTextColor="#888888"
        keyboardType="phone-pad"
        value={telefone}
        onChangeText={(texto) => setTelefone(formatarTelefone(texto))}
        maxLength={15}
      />

      <BotaoConcluir carregando={carregando} onPress={concluir} />

      <LinkVoltar onVoltar={onVoltar} />
    </MolduraFormulario>
  );
}

const styles = StyleSheet.create({
  telaEscolha: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: "center",
  },

  tituloEscolha: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
  },

  opcoesPerfil: { flex: 1, justifyContent: "center", gap: 56 },

  opcaoPerfil: {
    width: 200,
    height: 200,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
  },

  opcaoPerfilImagem: { width: 90, height: 90 },

  opcaoPerfilTexto: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 4,
  },

  // Formulários

  tela: { flex: 1 },
  conteudo: { flexGrow: 1, justifyContent: "center", padding: 16 },

  cartao: {
    backgroundColor: "#FFFFFF",
    borderRadius: 35,
    padding: 24,
    gap: 12,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  rotulo: { fontSize: 18, fontWeight: "bold", color: "#000000", marginTop: 8 },
  tipos: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tipo: {
    minWidth: 64,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  tipoTexto: { fontSize: 18, fontWeight: "bold", color: "#000000" },

  campo: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },

  linha: { flexDirection: "row", gap: 12 },

  opcao: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  opcaoTexto: { fontSize: 18, fontWeight: "bold", color: "#000000" },
  selecionado: { backgroundColor: COR_BOTAO },

  botao: {
    minHeight: 60,
    borderRadius: 16,
    backgroundColor: COR_BOTAO,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },

  botaoDesativado: { opacity: 0.6 },
  botaoTexto: { fontSize: 20, fontWeight: "bold", color: "#000000" },
  link: { alignItems: "center", paddingVertical: 12 },
  linkTexto: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    textDecorationLine: "underline",
  },
});
