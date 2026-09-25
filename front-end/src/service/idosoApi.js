import { api_auth } from "./api";

export async function getIdosos() {
  const resposta = await api_auth.get(`/idosos`);
  return resposta.data.result;
}

export async function getIdosoCuidador() {
  const resposta = await api_auth.get(`/idosoCuidador`);
  return resposta.data.result;
}

export async function getUsuarios() {
  const resposta = await api_auth.get(`/usuarios`);
  return resposta.data.result;
}

export async function getConsultas() {
  const resposta = await api_auth.get(`/consulta`);
  return resposta.data.result;
}

export async function getDoencas() {
  const resposta = await api_auth.get(`/doenca`);
  return resposta.data.result;
}

// CADASTRAR DADOS DO IDOSO (etapa final do cadastro)
export async function cadastrarIdoso({ idUsuario, tipoSanguineo, telefone, pcd, idImagem = null }) {
  const payload = {
    idUsuario,
    tipoSanguineo,
    telefone: (telefone || "").replace(/\D/g, ""),
    pcd: pcd ? "sim" : "nao",
    idImagem,
  };

  const resposta = await api_auth.post("/idosos", payload);
  return resposta.data;
}