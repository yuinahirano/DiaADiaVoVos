import { api_diadiavovos } from "./api";

export async function login(email, senha) {
    try {
        const resposta = await api_diadiavovos.post(`/usuarios/login`, { email, senha });
        const token = resposta.data.login.token;
        return token;
    } catch (erro) {
        console.error('Erro ao realizar login:', erro);
        throw erro;
    }
}

// Função para enviar os dados de cadastro para a API
export async function cadastrarUsuario(dadosUsuario) {
    try {
        const resposta = await api_diadiavovos.post(`/usuarios`, dadosUsuario);
        return resposta.data;
    } catch (erro) {
        console.error('Erro ao cadastrar usuário:', erro);
        throw erro;
    }
}