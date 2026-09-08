import { api_auth } from "./api";

export async function loginRequest(email, senha) {
  const response = await api_auth.post("/usuario/login", { email, senha });
  return response.data;
}

export async function getMeRequest() {
  const response = await api_auth.get("/usuario/me");
  return response.data;
}

export async function cadastrarUsuario(dados) {
  const resposta = await api_auth.post("/usuario", dados);
  return resposta.data;
}

export async function vincularIdosoCuidador({ idIdoso, idCuidador, telefoneEmergencia }) {
  const resposta = await api_auth.post("/idosos/vincular-cuidador", {
    idIdoso,
    idCuidador,
    telefoneEmergencia,
  });
  return resposta.data;
}