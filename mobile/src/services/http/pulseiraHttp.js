import axios from 'axios';
import * as Network from 'expo-network';

// A pulseira responde HTTP na rede local (mesmo Wi-Fi do celular).

function clientePulseira(ip) {
  return axios.create({
    baseURL: `http://${ip}`,
    timeout: 5000,
    headers: { Accept: 'application/json' },
  });
}

function traduzirErro(erro) {
  if (erro.response) return new Error(`Pulseira respondeu ${erro.response.status}`);
  if (erro.code === 'ECONNABORTED') return new Error('Pulseira não respondeu (tempo esgotado)');
  return new Error('Pulseira não encontrada na rede. Confira o IP e o Wi-Fi');
}

// Mesma regra do firmware (hostnameDe): "Pulseira Dia a Dia Vovos" -> "pulseira-dia-a-dia-vovos".
// Letras e números viram minúsculos; qualquer outra coisa vira um único "-".
// Acentos também viram "-" (ex.: "Seu José" -> "seu-jos"), igual ao firmware.
export function nomeParaHost(nome) {
  let h = String(nome ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  h = h.slice(0, 32).replace(/-+$/g, '');
  return h || 'pulseira';
}

// Confere se a pulseira está acessível. Retorna o JSON de /status.
export async function testarPulseira(ip) {
  try {
    const { data } = await clientePulseira(ip).get('/status');
    return data;
  } catch (e) {
    throw traduzirErro(e);
  }
}

// Busca as leituras guardadas na pulseira.
// Retorna [{ seq, medidoEm (epoch em segundos), bpm, spo2 }]
export async function lerLeituras(ip) {
  try {
    const { data } = await clientePulseira(ip).get('/leituras');
    return data.leituras ?? data;
  } catch (e) {
    throw traduzirErro(e);
  }
}

// Avisa a pulseira que as leituras até `ate` (seq) já foram guardadas no celular.
// Só depois disso ela apaga esses registros da flash.
export async function confirmarLeituras(ip, ate) {
  try {
    await clientePulseira(ip).post('/confirmar', null, { params: { ate } });
  } catch (e) {
    throw traduzirErro(e);
  }
}

// Manda para a pulseira o nome vindo da API (ex.: "Pulseira do Seu José").
// Ela passa a se chamar assim na rede que cria, no mDNS e no /status.
// Retorna { ok, nome, host }.
export async function definirNomePulseira(ip, nome) {
  try {
    const { data } = await clientePulseira(ip).post('/nome', null, { params: { valor: nome } });
    return data;
  } catch (e) {
    throw traduzirErro(e);
  }
}

// Pede para a pulseira esquecer o Wi-Fi e reiniciar no modo portal.
// Ela reinicia logo depois de responder, então a conexão pode cair.
export async function esquecerWifiPulseira(ip) {
  try {
    await clientePulseira(ip).post('/esquecer-wifi');
  } catch (e) {
    throw traduzirErro(e);
  }
}

// Procura as pulseiras na rede do celular: testa GET /status em todos os endereços x.x.x.1 a x.x.x.254.
// Retorna [{ ip, nome }] de quem respondeu como pulseira (normalmente 1). Leva alguns segundos.
// Firmware antigo não manda "nome": nesse caso aparece como "Pulseira".
export async function procurarPulseiras() {
  const meuIp = await Network.getIpAddressAsync();
  const partes = (meuIp ?? '').split('.');
  if (partes.length !== 4 || meuIp === '0.0.0.0') {
    throw new Error('Celular sem Wi-Fi. Conecte na mesma rede da pulseira');
  }
  const prefixo = partes.slice(0, 3).join('.');
  const hosts = Array.from({ length: 254 }, (_, i) => `${prefixo}.${i + 1}`);
  const achadas = [];

  const sondar = async (ip) => {
    try {
      const { data } = await axios.get(`http://${ip}/status`, { timeout: 800 });
      if (data?.ok === true && data?.registros !== undefined) {
        achadas.push({ ip, nome: data.nome || 'Pulseira' });
      }
    } catch {
      /* ninguém nesse endereço */
    }
  };

  for (let i = 0; i < hosts.length; i += 40) {
    await Promise.all(hosts.slice(i, i + 40).map(sondar)); // 40 por vez, para não sobrecarregar
  }
  return achadas;
}

// Acha a pulseira pelo nome que aparece na tela dela (ex.: "Pulseira do Seu José").
// 1) tenta o nome na rede (mDNS): http://pulseira-do-seu-jos.local (rápido, mas nem todo Android resolve)
// 2) se não deu, varre a rede e escolhe a pulseira cujo nome bate.
// Retorna { ip, nome } ou null.
export async function acharPorNome(nome) {
  const alvo = nomeParaHost(nome);

  try {
    const { data } = await axios.get(`http://${alvo}.local/status`, { timeout: 2500 });
    if (data?.ok === true && data?.registros !== undefined) {
      return { ip: data.ip || `${alvo}.local`, nome: data.nome || nome };
    }
  } catch {
    /* mDNS não resolveu: cai na varredura */
  }

  const achadas = await procurarPulseiras();
  return achadas.find((p) => nomeParaHost(p.nome) === alvo) ?? null;
}