export function validarNome(nome) {
  const limpo = String(nome ?? '').trim();
  if (!limpo) return 'Informe o nome completo';
  if (limpo.split(/\s+/).length < 2) return 'Informe nome e sobrenome';
  if (limpo.length < 5) return 'Nome muito curto';
  return '';
}

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarEmail(email) {
  const limpo = String(email ?? '').trim();
  if (!limpo) return 'Informe o e-mail';
  if (limpo.length > 254 || !REGEX_EMAIL.test(limpo)) return 'E-mail inválido';
  return '';
}

// Máscara 000.000.000-00
export function mascararCpf(texto) {
  const n = String(texto ?? '').replace(/\D/g, '').slice(0, 11);
  return n
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

// Calcula um dígito verificador do CPF
function digitoCpf(digitos, pesoInicial) {
  let soma = 0;
  for (let i = 0; i < digitos.length; i += 1) {
    soma += digitos[i] * (pesoInicial - i);
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function cpfValido(cpf) {
  const n = String(cpf ?? '').replace(/\D/g, '');
  if (n.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(n)) return false; // 111.111.111-11 etc.
  const digitos = n.split('').map(Number);
  const d1 = digitoCpf(digitos.slice(0, 9), 10);
  const d2 = digitoCpf(digitos.slice(0, 10), 11);
  return d1 === digitos[9] && d2 === digitos[10];
}

export function validarCpf(cpf) {
  const n = String(cpf ?? '').replace(/\D/g, '');
  if (!n) return 'Informe o CPF';
  if (n.length !== 11) return 'CPF incompleto';
  if (!cpfValido(n)) return 'CPF inválido';
  return '';
}


export const REGRAS_SENHA = [
  { id: 'tamanho', texto: 'Pelo menos 8 caracteres', ok: (s) => s.length >= 8 },
  { id: 'maiuscula', texto: 'Uma letra maiúscula', ok: (s) => /[A-Z]/.test(s) },
  { id: 'minuscula', texto: 'Uma letra minúscula', ok: (s) => /[a-z]/.test(s) },
  { id: 'numero', texto: 'Um número', ok: (s) => /\d/.test(s) },
  { id: 'especial', texto: 'Um caractere especial (ex: @ # $ !)', ok: (s) => /[^A-Za-z0-9]/.test(s) },
];

export function validarSenha(senha) {
  const s = String(senha ?? '');
  if (!s) return 'Informe a senha';
  if (s.length > 72) return 'Senha muito longa';
  if (/\s/.test(s)) return 'A senha não pode ter espaços';
  const faltando = REGRAS_SENHA.filter((r) => !r.ok(s));
  if (faltando.length > 0) return 'A senha ainda não é forte o bastante';
  return '';
}


const DATA_MINIMA = new Date(1900, 0, 1);

export function dataMinima() {
  return new Date(DATA_MINIMA);
}

// Date -> "DD/MM/AAAA"
export function formatarData(data) {
  if (!(data instanceof Date) || Number.isNaN(data.getTime())) return '';
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${data.getFullYear()}`;
}

// Date -> "AAAA-MM-DD" (usa a data local, sem desvio de fuso)
export function dataParaIso(data) {
  if (!(data instanceof Date) || Number.isNaN(data.getTime())) return '';
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

// Menores de idade PODEM se cadastrar: só recusa data inexistente, futura ou antiga demais.
export function validarDataNascimento(data) {
  if (!data) return 'Informe a data de nascimento';
  if (!(data instanceof Date) || Number.isNaN(data.getTime())) return 'Data inválida';
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  if (data > hoje) return 'A data não pode ser no futuro';
  if (data < DATA_MINIMA) return 'Data inválida';
  return '';
}


export const ESTADOS_CIVIS = [
  { valor: 'solteiro', texto: 'Solteiro(a)' },
  { valor: 'casado', texto: 'Casado(a)' },
  { valor: 'divorciado', texto: 'Divorciado(a)' },
  { valor: 'viúvo', texto: 'Viúvo(a)' },
  { valor: 'separado', texto: 'Separado(a)' },
];

export function validarEstadoCivil(valor) {
  if (!valor) return 'Selecione o estado civil';
  if (!ESTADOS_CIVIS.some((e) => e.valor === valor)) return 'Estado civil inválido';
  return '';
}

// Mantém só os dígitos: "(19) 99999-0000" -> "19999990000"
export function apenasDigitos(texto) {
  return String(texto || '').replace(/\D/g, '');
}

// Máscara enquanto digita: (DD) 99999-9999 ou (DD) 9999-9999
export function formatarTelefone(texto) {
  const d = apenasDigitos(texto).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// DDD + 8 ou 9 dígitos
export function telefoneValido(texto) {
  const tamanho = apenasDigitos(texto).length;
  return tamanho === 10 || tamanho === 11;
}