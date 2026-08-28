import { api_diadiavovos } from "./api";

export async function getMedicamentos() {
    try {
        // Envia o email e senha no corpo (body) da requisição
        const resposta = await api_diadiavovos.get(`/medicamento`);
        return resposta.data;

    } catch (erro) {
        console.error('Erro ao buscar medicamentos:', erro);
        throw erro; // Lança o erro para o componente poder tratar (ex: exibir mensagem)
    }
}