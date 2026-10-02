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

export async function addConsulta(dadosConsulta) {
  try {
    const resposta = await api_auth.post(`/consulta`, dadosConsulta);
    return resposta.data.result;
  } catch (erro) {
    console.error("Erro ao adicionar consulta:", erro);
    throw erro;
  }
}

export async function updateConsulta(id, dadosConsulta) {
  try {
    const resposta = await api_auth.put(`/consulta/${id}`, dadosConsulta);
    return resposta.data.result;
  } catch (erro) {
    console.error("Erro ao atualizar consulta:", erro);
    throw erro;
  }
}

export async function deleteConsulta(id) {
  try {
    const resposta = await api_auth.delete(`/consulta/${id}`);
    return resposta.data.result;
  } catch (erro) {
    console.error("Erro ao deletar consulta:", erro);
    throw erro;
  }
}