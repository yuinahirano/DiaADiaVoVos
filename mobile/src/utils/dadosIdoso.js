const doisDigitos = (n) => String(n).padStart(2, '0');

// Aceita "2026-10-15", "2026-10-15T00:00:00.000Z" (usa o dia escrito)
// ou data com horário (usa o dia local do aparelho)
function partesDaData(valor) {
  const texto = String(valor ?? '').trim();

  if (!texto) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}(T00:00:00(\.0+)?Z)?$/.test(texto)) {
    const [ano, mes, dia] = texto.slice(0, 10).split('-').map(Number);

    return { ano, mes, dia };
  }

  const data = new Date(texto);

  if (Number.isNaN(data.getTime())) {
    return null;
  }

  return {
    ano: data.getFullYear(),
    mes: data.getMonth() + 1,
    dia: data.getDate(),
  };
}

// "2026-10-15" -> "15/10/2026"
export function formatarData(valor) {
  const partes = partesDaData(valor);

  if (!partes) {
    return String(valor ?? '').trim();
  }

  return `${doisDigitos(partes.dia)}/${doisDigitos(partes.mes)}/${partes.ano}`;
}

// Momento exato da consulta. Sem horário, vale o fim do dia.
function momentoDaConsulta(data, horario) {
  const partes = partesDaData(data);

  if (!partes) {
    return null;
  }

  const hora = /^(\d{2}):(\d{2})/.exec(String(horario ?? '').trim());
  const h = hora ? Number(hora[1]) : 23;
  const min = hora ? Number(hora[2]) : 59;

  return new Date(partes.ano, partes.mes - 1, partes.dia, h, min);
}

// Aceita nome_medico ou nomeMedico, etc. (a API devolve as colunas do banco)
export function lerConsulta(item) {
  const compareceu = item.compareceu;

  return {
    medico: item.nome_medico ?? item.nomeMedico,
    local: item.local_consulta ?? item.localConsulta,
    data: item.data,
    horario: item.horario,
    descricao: item.descricao,
    compareceu:
      compareceu === true || compareceu === 1 || compareceu === '1',
  };
}

// chave: 'compareceu' | 'agendada' | 'faltou'
export function statusDaConsulta(c, agora) {
  if (c.compareceu) {
    return {
      chave: 'compareceu',
      texto: 'Compareceu',
      icone: 'check-circle-outline',
    };
  }

  const momento = momentoDaConsulta(c.data, c.horario);

  if (momento && momento.getTime() < agora) {
    return {
      chave: 'faltou',
      texto: 'Não compareceu',
      icone: 'close-circle-outline',
    };
  }

  return { chave: 'agendada', texto: 'Agendada', icone: 'clock-outline' };
}

// Futuras primeiro (da mais próxima), depois as passadas (da mais recente)
export function ordenarConsultas(lista, agora) {
  const comTempo = lista.map((item) => {
    const c = lerConsulta(item);
    const momento = momentoDaConsulta(c.data, c.horario);

    return { item, tempo: momento ? momento.getTime() : null };
  });

  const futuras = comTempo
    .filter((x) => x.tempo !== null && x.tempo >= agora)
    .sort((a, b) => a.tempo - b.tempo);

  const passadas = comTempo
    .filter((x) => x.tempo !== null && x.tempo < agora)
    .sort((a, b) => b.tempo - a.tempo);

  const semData = comTempo.filter((x) => x.tempo === null);

  return [...futuras, ...passadas, ...semData].map((x) => x.item);
}