import api, { idDoUsuarioLogado } from './api';

// ---------- Rotas ----------
// GET /usuario/me -> dados de quem está logado (inclui idIdoso)
const ROTA_ME = '/usuario/me';

// GET /idosos/:idIdoso
const rotaIdoso = (idIdoso) => `/idosos/${encodeURIComponent(idIdoso)}`;

// GET /usuario/:idUsuario
const rotaUsuario = (idUsuario) => `/usuario/${encodeURIComponent(idUsuario)}`;

// GET /doenca/usuario/:idUsuario
const rotaDoencasDoUsuario = (idUsuario) =>
  `/doenca/usuario/${encodeURIComponent(idUsuario)}`;

// GET /enderecos/usuario/:idUsuario
const rotaEnderecosDoUsuario = (idUsuario) =>
  `/enderecos/usuario/${encodeURIComponent(idUsuario)}`;

// POST /medicamento/:id/dose -> o idoso confirma que tomou a dose
const rotaRegistrarDose = (idMedicamento) =>
  `/medicamento/${encodeURIComponent(idMedicamento)}/dose`;

// Procura a lista na resposta, não importa o formato:
// { result: [...] }, { result: {...} }, [...] direto, etc.
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
    data.doencas,
    data.enderecos,
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

// Tira a senha (hash) para ela nunca chegar até a tela
function semSenha(usuario) {
  if (!usuario || typeof usuario !== 'object') {
    return null;
  }

  const { senha, ...resto } = usuario;

  return resto;
}

// Quem está logado, direto de GET /usuario/me
export async function buscarMeuUsuario() {
  const { data } = await api.get(ROTA_ME);

  const resultado = data?.result;
  const usuario = Array.isArray(resultado)
    ? resultado[0]
    : resultado ?? data?.usuario ?? data?.user ?? null;

  if (!usuario || typeof usuario !== 'object') {
    throw new Error('Não achei os dados de quem está logado em /usuario/me');
  }

  return usuario;
}

// Id do IDOSO de quem está logado (espera idIdoso em /usuario/me)
export async function idDoIdosoLogado() {
  const usuario = await buscarMeuUsuario();

  const id = usuario.idIdoso ?? usuario.id_idoso;

  if (id === undefined || id === null || id === '') {
    throw new Error(
      `Não achei o id do idoso em /usuario/me (campos: ${Object.keys(
        usuario,
      ).join(', ')})`,
    );
  }

  return String(id);
}

// GET /idosos/:idIdoso
// -> { result: [{ id, tipo_sanguineo, telefone, pcd, id_usuario, id_imagem }] }
export async function buscarMeuPerfilIdoso(idIdoso) {
  const { data } = await api.get(rotaIdoso(idIdoso));

  return extrairLista(data)[0] ?? null;
}

// GET /usuario/:idUsuario
export async function buscarUsuarioDoIdoso(idUsuario) {
  const { data } = await api.get(rotaUsuario(idUsuario));

  return semSenha(extrairLista(data)[0] ?? null);
}

// GET -> doenças do idoso (pelo id do USUÁRIO)
export async function listarMinhasDoencas(idUsuario) {
  const { data } = await api.get(rotaDoencasDoUsuario(idUsuario));

  return extrairLista(data);
}

// GET -> endereços do idoso (pelo id do USUÁRIO)
export async function listarMeusEnderecos(idUsuario) {
  const { data } = await api.get(rotaEnderecosDoUsuario(idUsuario));

  return extrairLista(data);
}

// Carrega tudo da tela "Meus dados" de uma vez, usando quem está logado.
// Nunca lança erro: o que falhar vem marcado em "falhas" e o dado fica vazio.
export async function carregarMeusDados() {
  let eu = null;

  try {
    eu = await buscarMeuUsuario();
  } catch {
    return {
      dados: { idoso: null, usuario: null, doencas: [], enderecos: [] },
      falhas: { idoso: true, usuario: true, doencas: true, enderecos: true },
    };
  }

  const idIdoso = eu.idIdoso ?? eu.id_idoso;
  const idUsuario = eu.id_usuario ?? eu.idUsuario ?? eu.id;

  const semId = () => Promise.reject(new Error('Id não informado'));

  const [idoso, usuario, doencas, enderecos] = await Promise.allSettled([
    idIdoso ? buscarMeuPerfilIdoso(idIdoso) : semId(),
    idUsuario ? buscarUsuarioDoIdoso(idUsuario) : semId(),
    idUsuario ? listarMinhasDoencas(idUsuario) : semId(),
    idUsuario ? listarMeusEnderecos(idUsuario) : semId(),
  ]);

  const valor = (r, padrao) =>
    r.status === 'fulfilled' ? r.value ?? padrao : padrao;

  const falhou = (r) => r.status === 'rejected';

  // Se a busca do usuário falhar, usa o que já veio de /usuario/me
  const usuarioFinal = valor(usuario, null) ?? semSenha(eu);

  return {
    dados: {
      idoso: valor(idoso, null),
      usuario: usuarioFinal,
      doencas: valor(doencas, []),
      enderecos: valor(enderecos, []),
    },
    falhas: {
      idoso: falhou(idoso),
      usuario: !usuarioFinal,
      doencas: falhou(doencas),
      // A rota de endereços pode não existir: falha vira lista vazia, sem aviso
      enderecos: false,
    },
  };
}

// GET /consulta/idosos/:idIdoso -> consultas do idoso logado
export async function listarConsultasDoIdoso() {
  const idIdoso = await idDoIdosoLogado();

  const { data } = await api.get(
    `/consulta/idosos/${encodeURIComponent(idIdoso)}`,
  );

  return extrairLista(data);
}

// GET /medicamento/idosos/:idIdoso -> medicamentos do idoso logado
export async function listarMedicamentosDoIdoso() {
  const idIdoso = await idDoIdosoLogado();

  const { data } = await api.get(
    `/medicamento/idosos/${encodeURIComponent(idIdoso)}`,
  );

  return extrairLista(data);
}

// POST /medicamento/:id/dose -> idoso confirma que tomou a dose agora.
// Volta { ultimaDose, proximoHorario } já calculados pelo back.
export async function registrarDoseMedicamento(idMedicamento) {
  const { data } = await api.post(rotaRegistrarDose(idMedicamento));

  return data?.result ?? data;
}

// GET /doenca/usuario/:idUsuario -> doenças do idoso logado (mesma rota de listarMinhasDoencas)
export async function listarDoencasDoIdoso() {
  const idUsuario = await idDoUsuarioLogado();

  return listarMinhasDoencas(idUsuario);
}

// GET /solicitacaoCuidador/idoso/:idIdoso -> pedidos de vínculo de cuidador
// (só os ainda pendentes; aceitos/recusados/expirados não aparecem na tela)
export async function listarSolicitacoesDoIdoso() {
  const idIdoso = await idDoIdosoLogado();

  const { data } = await api.get(
    `/solicitacaoCuidador/idoso/${encodeURIComponent(idIdoso)}`,
  );

  return extrairLista(data).filter(
    (s) => (s.status ?? 'pendente') === 'pendente',
  );
}

// Junta consultas e pedidos de cuidador pendentes para a Home e as Notificações.
// Cada parte falha sozinha (vira lista vazia) para não travar a outra.
export async function listarAvisosDoIdoso() {
  const [consultas, solicitacoes] = await Promise.all([
    listarConsultasDoIdoso().catch(() => []),
    listarSolicitacoesDoIdoso().catch(() => []),
  ]);

  return { consultas, solicitacoes };
}

// PATCH /solicitacaoCuidador/:id/aceitar
export async function aceitarSolicitacao(id) {
  const { data } = await api.patch(
    `/solicitacaoCuidador/${encodeURIComponent(id)}/aceitar`,
  );

  return data;
}

// PATCH /solicitacaoCuidador/:id/recusar
export async function recusarSolicitacao(id) {
  const { data } = await api.patch(
    `/solicitacaoCuidador/${encodeURIComponent(id)}/recusar`,
  );

  return data;
}