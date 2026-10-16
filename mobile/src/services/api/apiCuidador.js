import axios from 'axios';
import api from './api';

// (a antiga /idosoCuidador/:id busca pelo id do vínculo, não pelo do cuidador)
const rotaIdososDoCuidador = (idCuidador) =>
  `/idosoCuidador/cuidador/${encodeURIComponent(idCuidador)}`;

// POST /solicitacaoCuidador -> cria a solicitação de vínculo
const ROTA_SOLICITACAO = '/solicitacaoCuidador';

// Sempre 3 dias, o usuário não pode alterar
const DIAS_PARA_EXPIRAR = 3;

// /enderecos -> cadastra (POST), edita (PUT /:id) e apaga (DELETE /:id)
const ROTA_ENDERECOS = '/enderecos';

// GET /usuario/:idUsuario -> dados do usuário
const rotaUsuario = (idUsuario) => `/usuario/${encodeURIComponent(idUsuario)}`;

// GET -> endereços do idoso
const rotaEnderecosDoUsuario = (idUsuario) =>
  `/enderecos/usuario/${encodeURIComponent(idUsuario)}`;

// Rota base de cada tipo de registro (usada em criar, editar e excluir)
const ROTAS_REGISTRO = {
  consultas: '/consulta',
  medicamentos: '/medicamento',
  doencas: '/doenca',
};

function rotaDoRegistro(tipo) {
  const rota = ROTAS_REGISTRO[tipo];

  if (!rota) {
    throw new Error(`Tipo de registro desconhecido: ${tipo}`);
  }

  return rota;
}

// Procura a lista na resposta, não importa o formato:
// { result: [...] }, { result: {...} }, { idosos: [...] }, [...] direto, etc.
function extrairLista(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return [];
  }

  const candidatos = [
    data.result,
    data.idosos,
    data.idoso,
    data.medicamentos,
    data.consultas,
    data.doencas,
    data.data,
    data.items,
  ];

  for (const c of candidatos) {
    if (Array.isArray(c)) {
      return c;
    }

    if (c && typeof c === 'object') {
      return [c];
    }
  }

  // A própria resposta é um item
  return data.nome ? [data] : [];
}

// Id do CUIDADOR de quem está logado.
// Espera que GET /usuario/me devolva idCuidador (igual faz com idIdoso).
export async function idDoCuidadorLogado() {
  const { data } = await api.get('/usuario/me');

  const resultado = data?.result;
  const usuario = Array.isArray(resultado)
    ? resultado[0]
    : resultado ?? data?.usuario ?? data?.user;

  const id = usuario?.idCuidador ?? usuario?.id_cuidador;

  if (id === undefined || id === null || id === '') {
    const campos =
      usuario && typeof usuario === 'object'
        ? Object.keys(usuario).join(', ')
        : 'nenhum';

    throw new Error(
      `Não achei o id do cuidador em /usuario/me (campos: ${campos})`,
    );
  }

  return String(id);
}

// POST /solicitacaoCuidador -> solicita vínculo com um idoso pelo e-mail
// Corpo enviado:
// { emailIdoso, idCuidador, contatoEmergencia, diasParaExpirar: 3 }
export async function solicitarVinculoPorEmail({
  emailIdoso,
  contatoEmergencia,
}) {
  const idCuidador = await idDoCuidadorLogado();

  const { data } = await api.post(ROTA_SOLICITACAO, {
    emailIdoso: emailIdoso.trim().toLowerCase(),
    idCuidador,
    contatoEmergencia: contatoEmergencia.replace(/\D/g, ''),
    diasParaExpirar: DIAS_PARA_EXPIRAR,
  });

  return data;
}

// GET /idosos/:idIdoso
// -> { result: [{ id, tipo_sanguineo, telefone, pcd, id_usuario, id_imagem }] }
export async function buscarIdoso(idIdoso) {
  const { data } = await api.get(`/idosos/${encodeURIComponent(idIdoso)}`);

  return extrairLista(data)[0] ?? null;
}

// GET /usuario/:idUsuario
// -> { result: [{ id, nome, cpf, email, data_nascimento, estado_civil, ... }] }
// A senha (hash) é removida aqui para nunca chegar até a tela.
export async function buscarUsuario(idUsuario) {
  const { data } = await api.get(rotaUsuario(idUsuario));

  const usuario = extrairLista(data)[0] ?? null;

  if (!usuario) {
    return null;
  }

  const { senha, ...semSenha } = usuario;

  return semSenha;
}

// GET -> endereços já cadastrados do idoso (pelo id do USUÁRIO do idoso)
export async function listarEnderecosDoIdoso(idUsuario) {
  const { data } = await api.get(rotaEnderecosDoUsuario(idUsuario));

  return extrairLista(data);
}

// POST /enderecos -> cadastra o endereço do idoso
// idUsuario = id_usuario do IDOSO (não o do cuidador)
// numero "0000" (só zeros) vai como 0 e a tela mostra "Sem número"
function corpoEndereco({ nome, numero, complemento, cep, idUsuario }) {
  return {
    nome: String(nome ?? '').trim(),
    numero: Number(String(numero).replace(/\D/g, '')),
    complemento: String(complemento ?? '').trim(),
    cep: String(cep).replace(/\D/g, ''),
    idUsuario,
  };
}

export async function cadastrarEndereco(dados) {
  const { data } = await api.post(ROTA_ENDERECOS, corpoEndereco(dados));

  return data;
}

// PUT /enderecos/:id -> edita o endereço do idoso
export async function editarEndereco(idEndereco, dados) {
  const { data } = await api.put(
    `${ROTA_ENDERECOS}/${encodeURIComponent(idEndereco)}`,
    corpoEndereco(dados),
  );

  return data;
}

// DELETE /enderecos/:id -> apaga o endereço do idoso
export async function apagarEndereco(idEndereco) {
  const { data } = await api.delete(
    `${ROTA_ENDERECOS}/${encodeURIComponent(idEndereco)}`,
  );

  return data;
}

// Tira o endereço de dentro da resposta do POST/PUT (se a API devolver algum)
export function extrairEndereco(data) {
  return extrairLista(data)[0] ?? null;
}

// ViaCEP: completa logradouro, bairro, cidade e UF quando o back não devolve.
// Nunca lança erro: sem internet ou CEP inexistente devolve null.
// Usa o axios "puro" (e não a instância "api"): a "api" manda o JWT do usuário
// e usa a URL do back, o que não serve para um site externo.
export async function buscarCep(cep) {
  const digitos = String(cep).replace(/\D/g, '');

  if (digitos.length !== 8) {
    return null;
  }

  try {
    // O axios já lança erro para status fora de 2xx (cai no catch -> null)
    const { data: json } = await axios.get(
      `https://viacep.com.br/ws/${digitos}/json/`,
    );

    if (!json || typeof json !== 'object' || json.erro) {
      return null;
    }

    return {
      cep: digitos,
      logradouro: json.logradouro ?? '',
      bairro: json.bairro ?? '',
      cidade: json.localidade ?? '',
      uf: json.uf ?? '',
    };
  } catch (e) {
    return null;
  }
}

// GET -> idosos vinculados ao cuidador logado
// Cada item (esperado): { id, nome, ... }
export async function listarIdososDoCuidador() {
  const idCuidador = await idDoCuidadorLogado();

  const { data } = await api.get(rotaIdososDoCuidador(idCuidador));

  return extrairLista(data);
}

// GET /consulta/idosos/:idIdoso -> consultas de um idoso vinculado
export async function listarConsultasDoIdosoVinculado(idIdoso) {
  const { data } = await api.get(
    `/consulta/idosos/${encodeURIComponent(idIdoso)}`,
  );

  return extrairLista(data);
}

// GET /medicamento/idosos/:idIdoso -> medicamentos de um idoso vinculado
export async function listarMedicamentosDoIdosoVinculado(idIdoso) {
  const { data } = await api.get(
    `/medicamento/idosos/${encodeURIComponent(idIdoso)}`,
  );

  return extrairLista(data);
}

// GET /doenca/usuario/:idUsuario -> doenças pelo id do USUÁRIO do idoso
export async function listarDoencasDoIdosoVinculado(idUsuario) {
  const { data } = await api.get(
    `/doenca/usuario/${encodeURIComponent(idUsuario)}`,
  );

  return extrairLista(data);
}

// POST /consulta | /medicamento | /doenca (só cuidador)
// tipo: 'consultas' | 'medicamentos' | 'doencas'
export async function criarRegistro(tipo, corpo) {
  const { data } = await api.post(rotaDoRegistro(tipo), corpo);

  return data;
}

// PUT /consulta/:id | /medicamento/:id | /doenca/:id (só cuidador)
export async function editarRegistro(tipo, id, corpo) {
  const { data } = await api.put(
    `${rotaDoRegistro(tipo)}/${encodeURIComponent(id)}`,
    corpo,
  );

  return data;
}

// DELETE /consulta/:id | /medicamento/:id | /doenca/:id (só cuidador)
export async function excluirRegistro(tipo, id) {
  const { data } = await api.delete(
    `${rotaDoRegistro(tipo)}/${encodeURIComponent(id)}`,
  );

  return data;
}

// PATCH /consulta/:id/compareceu -> muda o status da consulta (só cuidador)
export async function marcarConsultaCompareceu(idConsulta) {
  const { data } = await api.patch(
    `/consulta/${encodeURIComponent(idConsulta)}/compareceu`,
  );

  return data;
}

// Consultas, medicamentos e doenças em paralelo.
// Nunca lança erro: o que falhar vem marcado em "falhas" e a lista fica vazia.
export async function carregarResumoDoIdoso({ idIdoso, idUsuario }) {
  const [consultas, medicamentos, doencas] = await Promise.allSettled([
    listarConsultasDoIdosoVinculado(idIdoso),
    listarMedicamentosDoIdosoVinculado(idIdoso),
    idUsuario
      ? listarDoencasDoIdosoVinculado(idUsuario)
      : Promise.reject(new Error('Id do usuário do idoso não informado')),
  ]);

  const valor = (r) => (r.status === 'fulfilled' ? r.value : []);
  const falhou = (r) => r.status === 'rejected';

  return {
    dados: {
      consultas: valor(consultas),
      medicamentos: valor(medicamentos),
      doencas: valor(doencas),
    },
    falhas: {
      consultas: falhou(consultas),
      medicamentos: falhou(medicamentos),
      doencas: falhou(doencas),
    },
  };
}