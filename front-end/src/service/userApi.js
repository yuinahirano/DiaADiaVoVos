import { api_auth } from "./api";

// 1. LOGIN DE USUÁRIO
export async function loginRequest(email, senha) {
  const response = await api_auth.post("/usuario/login", { email, senha });
  return response.data;
}

// 2. BUSCAR DADOS DO USUÁRIO LOGADO
export async function getMeRequest() {
  const response = await api_auth.get("/usuario/me");
  return response.data;
}

// 3. CADASTRO DE USUÁRIO
export async function cadastrarUsuario(dados) {
  const resposta = await api_auth.post("/usuario", dados);
  return resposta.data;
}

// 4. VINCULAR IDOSO AO CUIDADOR
export async function vincularIdosoCuidador({ idIdoso, idCuidador, telefoneEmergencia }) {
  const resposta = await api_auth.post("/idosos/vincular-cuidador", {
    idIdoso,
    idCuidador,
    telefoneEmergencia,
  });
  return resposta.data;
}

// 5. OBTER A LISTA DE VÍNCULOS IDOSO-CUIDADOR
export async function getIdosoCuidador() {
  const resposta = await api_auth.get("/idosoCuidador");
  return resposta.data.result || resposta.data;
}

// 6. OBTER A LISTA DE USUÁRIOS
export async function getUsuarios() {
  const resposta = await api_auth.get("/usuarios");
  return resposta.data.result || resposta.data;
}

// 7. OBTER A LISTA DE IDOSOS
export async function getIdosos() {
  const resposta = await api_auth.get("/idosos");
  return resposta.data.result || resposta.data;
}

// 8. OBTER A LISTA DE CUIDADORES (mapeia id_usuario -> id_cuidador)
export async function getCuidadores() {
  const resposta = await api_auth.get("/cuidadores"); // <-- era "/cuidador"
  return resposta.data.result || resposta.data;
}