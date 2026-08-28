import { api_diadiavovos } from "./api";

export async function login(email, senha) {
    try {
        // Envia o email e senha no corpo (body) da requisição
        const resposta = await api_diadiavovos.post(`/usuarios/login`, { email, senha });
        const token = resposta.data.login.token;
        return token;

    } catch (erro) {
        console.error('Erro ao realizar login:', erro);
        throw erro; // Lança o erro para o componente poder tratar (ex: exibir mensagem)
    }
}