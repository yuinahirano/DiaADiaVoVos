import { api_diadiavovos } from "./api";

export async function getRegistroSaude() {
  try {
    const resposta = await api_diadiavovos.get("/registroSaude");
    return resposta.data.result ?? resposta.data;
  } catch (erro) {
    console.error("Erro ao buscar registros de saúde:", erro);
    throw erro;
  }
}