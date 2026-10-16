import axios from 'axios';
import { API_URL } from './config';
import { lerJwt, salvarJwt, apagarJwt } from '../storage/auth';
import { apenasDigitos } from '../../utils/validacoes';

// O App registra aqui o que fazer quando a sessão expira (voltar para o login)
let aoExpirar = null;

// Evita disparar o logout várias vezes quando várias requisições falham juntas
let expirando = false;

export function aoSessaoExpirar(fn) {
  aoExpirar = fn;
}

// Erros de token que a API devolve como 500 (ex.: depois de reiniciar o back).
// Se o back passar a responder 401, isso deixa de ser necessário.
const TOKEN_INVALIDO_NA_MENSAGEM =
  /jwt|jsonwebtoken|expired|expirad|signature|malformed/i;

// Paliativo: se o back responder 500 nessas rotas, trata como sessão caída.
// (Um 500 real de servidor nelas também vai mandar para o login.)
// Para desligar, deixe a lista vazia: [].
const ROTAS_500_VIRAM_SESSAO_CAIDA = ['/usuario/me'];

function textoDoErro(erro) {
  const d = erro.response?.data;

  if (typeof d === 'string') {
    return d;
  }

  return [d?.message, d?.mensagem, d?.error, d?.erro]
    .filter((x) => typeof x === 'string')
    .join(' ');
}

// true quando o erro significa "o token não vale mais"
function sessaoInvalida(erro) {
  const status = erro.response?.status;

  if (!status) {
    return false;
  }

  const url = erro.config?.url ?? '';

  // Em /leitura o 401 pode ser só o token da pulseira, então não desloga
  if (url.startsWith('/leitura')) {
    return false;
  }

  if (status === 401) {
    return true;
  }

  if (status === 403 || status === 500) {
    if (TOKEN_INVALIDO_NA_MENSAGEM.test(textoDoErro(erro))) {
      return true;
    }

    if (
      status === 500 &&
      ROTAS_500_VIRAM_SESSAO_CAIDA.some((rota) => url.startsWith(rota))
    ) {
      return true;
    }
  }

  return false;
}

// Limpa o token e manda para o login (mesmo caminho do botão "Sair da conta")
async function expirarSessao() {
  if (expirando) {
    return;
  }

  expirando = true;

  await apagarJwt();
  aoExpirar?.();
}

// Erro marcado como "sessão expirada": as telas podem ignorar sem mostrar nada
function erroSessaoExpirada() {
  const e = new Error('Sessão expirada. Faça login novamente');
  e.sessaoExpirada = true;

  return e;
}

function criarInstancia() {
  const instancia = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  // Avisa com clareza se o .env não foi lido
  instancia.interceptors.request.use((config) => {
    if (!API_URL) {
      throw new Error(
        '_API_URL não está definida no .env (reinicie o Expo com: npx expo start -c)',
      );
    }

    return config;
  });

  return instancia;
}

// Padroniza o erro: sempre um Error com mensagem legível
// - e.status: código HTTP, quando a API respondeu
// - e.rede: true quando não deu para falar com a API (sem conexão ou tempo esgotado)
function traduzirErro(erro) {
  if (erro.response) {
    const msg = textoDoErro(erro);

    const e = new Error(
      `API respondeu ${erro.response.status}${msg ? `: ${msg}` : ''}`,
    );
    e.status = erro.response.status;

    return e;
  }

  if (erro.code === 'ECONNABORTED') {
    const e = new Error('Tempo esgotado ao falar com a API');
    e.rede = true;

    return e;
  }

  if (erro.message === 'Network Error') {
    const e = new Error(
      `Sem conexão com a API (${erro.config?.baseURL}${erro.config?.url ?? ''}). Confira o EXPO_PUBLIC_API_URL e o Wi-Fi`,
    );
    e.rede = true;

    return e;
  }

  return erro;
}

// Sem JWT: usada no login e no cadastro
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

  if (!jwt) {
    // Sem token = sessão caída: volta para o login sem mostrar erro
    await expirarSessao();

    throw erroSessaoExpirada();
  }

  config.headers.Authorization = `Bearer ${jwt}`;

  return config;
});

api.interceptors.response.use(
  (resposta) => resposta,
  async (erro) => {
    // Já é um erro nosso (ex.: lançado pelo interceptor de request)
    if (erro?.sessaoExpirada) {
      throw erro;
    }

    if (sessaoInvalida(erro)) {
      await expirarSessao();

      throw erroSessaoExpirada();
    }

    throw traduzirErro(erro);
  },
);

const PARECE_JWT = /^eyJ[\w-]+\.[\w-]+\.[\w-]+$/;

// Acha o token na resposta do login, não importa o nome do campo:
// aceita a resposta ser o próprio token, ou um JWT em qualquer campo (até 2 níveis).
function extrairToken(data) {
  if (typeof data === 'string') {
    return PARECE_JWT.test(data.trim()) ? data.trim() : null;
  }

  if (!data || typeof data !== 'object') {
    return null;
  }

  for (const valor of Object.values(data)) {
    const achado = extrairToken(valor);

    if (achado) {
      return achado;
    }
  }

  return null;
}

// Decodifica base64url (parte do meio do JWT) sem depender de atob/biblioteca
const LETRAS_B64 =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

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

  const percentual = bytes
    .map((b) => `%${b.toString(16).padStart(2, '0')}`)
    .join('');

  return decodeURIComponent(percentual);
}

function lerPayload(jwt) {
  const partes = String(jwt).split('.');

  if (partes.length !== 3) {
    throw new Error('Token de login inválido');
  }

  return JSON.parse(decodificarBase64Url(partes[1]));
}

// Id de quem está logado, tirado de dentro do JWT salvo no celular.
// Se o login usa outro nome de campo no token, acrescente aqui.
export async function idDoUsuarioLogado() {
  const jwt = await lerJwt();

  if (!jwt) {
    throw new Error('Usuário não está logado');
  }

  const payload = lerPayload(jwt);
  const id =
    payload.id ??
    payload.idCuidador ??
    payload.idUsuario ??
    payload.sub;

  if (id === undefined || id === null) {
    throw new Error(
      `Não achei o id no token (campos: ${Object.keys(payload).join(', ')})`,
    );
  }

  return String(id);
}

// Perfil de quem está logado: 'cuidador', 'idoso' ou null (usuário sem role).
// Igual ao front web: GET /usuario/me -> { result: [{ id, role, ... }] } e usa o campo role.
export async function perfilDoUsuarioLogado() {
  const { data } = await api.get('/usuario/me');
  const role = String(data.result?.[0]?.role ?? '').toLowerCase();

  if (role === 'cuidador' || role === 'idoso') {
    return role;
  }

  return null;
}

// Servidor acordando ou rede instável: o login tenta de novo sozinho.
// Credencial errada (400/401/403/404) nunca é repetida.
const STATUS_LOGIN_TENTAR_DE_NOVO = [502, 503, 504];
const TENTATIVAS_LOGIN = 2;
const ESPERA_LOGIN_MS = 1500;

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

async function postarLogin(email, senha) {
  for (let tentativa = 1; ; tentativa += 1) {
    try {
      return await apiPublica.post('/usuario/login', { email, senha });
    } catch (e) {
      const vale = e.rede || STATUS_LOGIN_TENTAR_DE_NOVO.includes(e.status);

      if (!vale || tentativa >= TENTATIVAS_LOGIN) {
        throw e;
      }

      await esperar(ESPERA_LOGIN_MS);
    }
  }
}

// Faz login e guarda o JWT
export async function login(email, senha) {
  const { data } = await postarLogin(email, senha);

  const token = extrairToken(data);

  if (!token) {
    const campos =
      data && typeof data === 'object'
        ? Object.keys(data).join(', ')
        : typeof data;

    throw new Error(
      `A API não devolveu o token de login (campos recebidos: ${campos || 'nenhum'})`,
    );
  }

  await salvarJwt(token);

  // Sessão nova: libera o aviso de expiração para a próxima vez
  expirando = false;

  return token;
}

// POST /usuarios -> cria o usuário (rota pública, sem JWT)
// dados: { nome, cpf, email, senha, dataNascimento (YYYY-MM-DD), estadoCivil? }
export async function cadastrarUsuario(dados) {
  const { data } = await apiPublica.post('/usuario', dados);

  return data;
}

export async function logout() {
  await apagarJwt();
}

// Retorna [{ id, nome, ... }] só das pulseiras do usuário logado.
// O app lê o id de dentro do token e pede GET /pulseira/usuario/:idUsuario
export async function listarPulseiras() {
  const idUsuario = await idDoUsuarioLogado();

  const { data } = await api.get(
    `/pulseira/usuario/${encodeURIComponent(idUsuario)}`,
  );

  return data.result ?? [];
}

// GET /pulseira/:id -> { result: [{ id, nome, ... }] }
// Retorna o objeto da pulseira (se a API devolver uma lista, pega o primeiro item).
export async function buscarPulseira(idPulseira) {
  const { data } = await api.get(`/pulseira/${idPulseira}`);
  const resultado = data.result;
  const pulseira = Array.isArray(resultado) ? resultado[0] : resultado;

  if (!pulseira) {
    throw new Error('Pulseira não encontrada');
  }

  return pulseira;
}

// Leituras de UMA pulseira, da mais recente para a mais antiga.
// Espera { result: [{ medidoEm (ou medido_em), bpm, spo2 }] }
export async function listarLeituras(idPulseira) {
  const { data } = await api.get(
    `/pulseira/${encodeURIComponent(idPulseira)}/leituras`,
  );

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

// POST /idosos
export async function cadastrarIdoso({ tipoSanguineo, telefone, pcd }) {
  const idUsuario = await idDoUsuarioLogado();

  await api.post('/idosos', {
    idUsuario,
    tipoSanguineo,
    telefone: apenasDigitos(telefone),
    pcd: pcd ? 'sim' : 'nao',
    idImagem: null,
  });
}

// POST /cuidadores
export async function cadastrarCuidador({ telefone }) {
  const idUsuario = await idDoUsuarioLogado();

  await api.post('/cuidadores', {
    idUsuario,
    telefone: apenasDigitos(telefone),
  });
}

export default api;