import { api_diadiavovos } from './api';

export async function login(email, senha) {
  // Alterado de '/login' para '/usuarios/login'
  const resposta = await api_diadiavovos.post('/usuarios/login', { email, senha });
  if (resposta.data?.token) {
    localStorage.setItem('token', resposta.data.token);
  }
  return resposta.data;
}

export async function cadastrarUsuario(dados) {
  const resposta = await api_diadiavovos.post('/usuarios', dados);
  return resposta.data;
}

export async function cadastrarDadosIdoso(dados) {
  const resposta = await api_diadiavovos.post('/idosos', dados);
  return resposta.data;
}

export async function cadastrarDadosCuidador(dados) {
  const resposta = await api_diadiavovos.post('/cuidadores', dados);
  return resposta.data;
}

// Exportações duplicadas (aliases) para compatibilidade com as páginas existentes
export { cadastrarDadosIdoso as cadastrarIdoso, cadastrarDadosCuidador as cadastrarCuidador };