import axios from 'axios';
import { API_URL } from './config';
import { lerJwt, salvarJwt, apagarJwt } from '../storage/auth';

// O App registra aqui o que fazer quando a sessão expira (voltar para o login)
let aoExpirar = null;
export function aoSessaoExpirar(fn) {
  aoExpirar = fn;
}

function criarInstancia() {
  const instancia = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  });

  // Avisa com clareza se o .env não foi lido
  instancia.interceptors.request.use((config) => {
    if (!API_URL) {
      throw new Error('EXPO_PUBLIC_API_URL não está definida no .env (reinicie o Expo com: npx expo start -c)');
    }
    return config;
  });

  return instancia;
}

// Padroniza o erro: sempre um Error com mensagem legível
function traduzirErro(erro) {
  if (erro.response) {
    const msg = erro.response.data?.message;
    return new Error(`API respondeu ${erro.response.status}${msg ? `: ${msg}` : ''}`);
  }
  if (erro.code === 'ECONNABORTED') return new Error('Tempo esgotado ao falar com a API');
  if (erro.message === 'Network Error') {
    return new Error(`Sem conexão com a API (${erro.config?.baseURL}${erro.config?.url ?? ''}). Confira o EXPO_PUBLIC_API_URL e o Wi-Fi`);
  }
  return erro;
}

// Sem JWT: usada só no login
const apiPublica = criarInstancia();
apiPublica.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    throw traduzirErro(erro);
  },
);

// Com JWT: injeta o token do usuário automaticamente em toda requisição
const api = criarInstancia();

api.interceptors.request.use(async (config) => {
  const jwt = await lerJwt();
  if (!jwt) throw new Error('Usuário não está logado');
  config.headers.Authorization = `Bearer ${jwt}`;
  return config;
});

api.interceptors.response.use(
  (resposta) => resposta,
  async (erro) => {
    // 401 nas rotas de usuário = token vencido. Em /leitura pode ser só o token da pulseira, então não desloga.
    const rotaDeLeitura = erro.config?.url?.startsWith('/leitura');
    if (erro.response?.status === 401 && !rotaDeLeitura) {
      await apagarJwt();
      aoExpirar?.();
      throw new Error('Sessão expirada. Faça login novamente');
    }
    throw traduzirErro(erro);
  },
);

const PARECE_JWT = /^eyJ[\w-]+\.[\w-]+\.[\w-]+$/;

// Acha o token na resposta do login, não importa o nome do campo:
// aceita a resposta ser o próprio token, ou um JWT em qualquer campo (até 2 níveis).
function extrairToken(data) {
  if (typeof data === 'string') return PARECE_JWT.test(data.trim()) ? data.trim() : null;
  if (!data || typeof data !== 'object') return null;
  for (const valor of Object.values(data)) {
    const achado = extrairToken(valor);
    if (achado) return achado;
  }
  return null;
}

// Decodifica base64url (parte do meio do JWT) sem depender de atob/biblioteca
const LETRAS_B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function decodificarBase64Url(texto) {
  const base64 = texto.replace(/-/g, '+').replace(/_/g, '/');
  const bytes = [];
  let valor = 0;
  let bits = 0;
  for (const c of base64) {
    if (c === '=') break;
    const i = LETRAS_B64.indexOf(c);
    if (i < 0) continue;
    valor = (valor << 6) | i;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((valor >> bits) & 0xff);
      valor &= (1 << bits) - 1;
    }
  }
  const percentual = bytes.map((b) => `%${b.toString(16).padStart(2, '0')}`).join('');
  return decodeURIComponent(percentual); // trata acentos (UTF-8)
}

function lerPayload(jwt) {
  const partes = String(jwt).split('.');
  if (partes.length !== 3) throw new Error('Token de login inválido');
  return JSON.parse(decodificarBase64Url(partes[1]));
}

// Id de quem está logado, tirado de dentro do JWT salvo no celular.
// AJUSTE: se o seu login usa outro nome de campo no token, acrescente aqui.
export async function idDoUsuarioLogado() {
  const jwt = await lerJwt();
  if (!jwt) throw new Error('Usuário não está logado');
  const payload = lerPayload(jwt);
  const id = payload.id ?? payload.idCuidador ?? payload.idUsuario ?? payload.sub;
  if (id === undefined || id === null) {
    throw new Error(`Não achei o id no token (campos: ${Object.keys(payload).join(', ')})`);
  }
  return String(id);
}

// Perfil de quem está logado: 'cuidador', 'idoso' ou null (usuário sem role).
// Igual ao front web: GET /usuario/me -> { result: [{ id, role, ... }] } e usa o campo role.
export async function perfilDoUsuarioLogado() {
  const { data } = await api.get('/usuario/me');
  const role = String(data.result?.[0]?.role ?? '').toLowerCase();
  if (role === 'cuidador' || role === 'idoso') return role;
  return null;
}

// Faz login e guarda o JWT
export async function login(email, senha) {
  const { data } = await apiPublica.post('/usuario/login', { email, senha });
  const token = extrairToken(data);
  if (!token) {
    const campos = data && typeof data === 'object' ? Object.keys(data).join(', ') : typeof data;
    throw new Error(`A API não devolveu o token de login (campos recebidos: ${campos || 'nenhum'})`);
  }
  await salvarJwt(token);
  return token;
}

export async function logout() {
  await apagarJwt();
}

// Retorna [{ id, nome, ... }] só das pulseiras do usuário logado.
// O app lê o id de dentro do token e pede GET /pulseira/usuario/:idUsuario
export async function listarPulseiras() {
  const idUsuario = await idDoUsuarioLogado();
  const { data } = await api.get(`/pulseira/usuario/${encodeURIComponent(idUsuario)}`);
  return data.result ?? [];
}

// GET /pulseira/:id -> { result: [{ id, nome, ... }] }
// Retorna o objeto da pulseira (se a API devolver uma lista, pega o primeiro item).
export async function buscarPulseira(idPulseira) {
  const { data } = await api.get(`/pulseira/${idPulseira}`);
  const resultado = data.result;
  const pulseira = Array.isArray(resultado) ? resultado[0] : resultado;
  if (!pulseira) throw new Error('Pulseira não encontrada');
  return pulseira;
}

// Leituras de UMA pulseira, da mais recente para a mais antiga.
// Espera { result: [{ medidoEm (ou medido_em), bpm, spo2 }] }
export async function listarLeituras(idPulseira) {
  const { data } = await api.get(`/pulseira/${encodeURIComponent(idPulseira)}/leituras`);
  return data.result ?? [];
}

// Gera um token novo (o anterior deixa de valer). Chame só ao vincular.
export async function vincularPulseira(idPulseira) {
  const { data } = await api.post(`/pulseira/${idPulseira}/vincular`);
  return data.token;
}

// leituras: [{ medidoEm (ISO 8601), bpm, spo2 }]
// Dois tokens: JWT do usuário (interceptor) + token da pulseira (x-device-token).
// Só retorna se a API respondeu 200/201; qualquer outra coisa lança erro e a fila é mantida.
// Resposta: { recebidas, inseridas, duplicadas, invalidas }
export async function enviarLote(deviceToken, leituras) {
  const { data } = await api.post(
    '/leitura/lote',
    { leituras },
    {
      headers: { 'x-device-token': deviceToken },
      validateStatus: (status) => status === 200 || status === 201,
    },
  );
  return data;
}

export default api;