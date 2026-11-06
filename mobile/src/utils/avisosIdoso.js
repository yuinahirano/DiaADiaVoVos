const doisDigitos = (n) => String(n).padStart(2, '0');

// "2026-10-15" ou "2026-10-15T00:00:00.000Z" -> usa o dia escrito (sem fuso);
// outras datas -> dia local do aparelho.
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

export function formatarData(valor) {
  const partes = partesDaData(valor);

  if (!partes) {
    return String(valor ?? '').trim();
  }

  return `${doisDigitos(partes.dia)}/${doisDigitos(partes.mes)}/${partes.ano}`;
}

// "14:30:00" -> "14:30"
export function formatarHorario(horario) {
  const texto = String(horario ?? '').trim();

  return /^\d{2}:\d{2}/.test(texto) ? texto.slice(0, 5) : texto;
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

function tempoRestante(minutos) {
  if (minutos <= 0) {
    return 'agora';
  }

  if (minutos < 60) {
    return `${minutos} min`;
  }

  const h = Math.floor(minutos / 60);
  const m = minutos % 60;

  return m ? `${h}h ${m}min` : `${h}h`;
}

// Consultas ainda não realizadas de hoje, amanhã e depois de amanhã.
// Cada item: { chave, id, medico, local, data, horario, descricao, momento, dias }
// dias: 0 = hoje, 1 = amanhã, 2 = depois de amanhã
export function consultasProximas(lista, agora = Date.now()) {
  const d = new Date(agora);
  const hoje = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  return (Array.isArray(lista) ? lista : [])
    .map((item, index) => {
      const compareceu = item?.compareceu;

      if (compareceu === true || compareceu === 1 || compareceu === '1') {
        return null;
      }

      const partes = partesDaData(item?.data);
      const momento = momentoDaConsulta(item?.data, item?.horario);

      if (!partes || !momento || momento.getTime() < agora) {
        return null;
      }

      const dia = new Date(partes.ano, partes.mes - 1, partes.dia);
      const dias = Math.round((dia.getTime() - hoje.getTime()) / 86400000);

      if (dias < 0 || dias > 2) {
        return null;
      }

      const medico = item.nome_medico ?? item.nomeMedico;

      return {
        chave: `consulta-${item.id ?? `${medico}-${index}`}`,
        id: item.id,
        medico,
        local: item.local_consulta ?? item.localConsulta,
        data: item.data,
        horario: item.horario,
        descricao: item.descricao,
        momento,
        dias,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.momento.getTime() - b.momento.getTime());
}

// Cor e texto do aviso conforme a proximidade da consulta
export function nivelDaConsulta(c, agora = Date.now()) {
  const minutos = Math.round((c.momento.getTime() - agora) / 60000);
  const hora = formatarHorario(c.horario);

  if (c.dias === 0 && minutos <= 120) {
    return {
      cor: '#F5877E',
      icone: 'alarm-light-outline',
      rotulo: 'Em breve',
      detalhe: `Começa em ${tempoRestante(minutos)}`,
      curto: `Hoje${hora ? ` às ${hora}` : ''}`,
    };
  }

  if (c.dias === 0) {
    return {
      cor: '#FFB561',
      icone: 'calendar-today',
      rotulo: 'Hoje',
      detalhe: hora ? `Hoje às ${hora}` : 'Hoje',
      curto: `Hoje${hora ? ` às ${hora}` : ''}`,
    };
  }

  if (c.dias === 1) {
    return {
      cor: '#FFE16A',
      icone: 'calendar-arrow-right',
      rotulo: 'Amanhã',
      detalhe: hora ? `Amanhã às ${hora}` : 'Amanhã',
      curto: `Amanhã${hora ? ` às ${hora}` : ''}`,
    };
  }

  return {
    cor: '#C9DDFF',
    icone: 'calendar-clock-outline',
    rotulo: 'Depois de amanhã',
    detalhe: hora ? `Depois de amanhã às ${hora}` : 'Depois de amanhã',
    curto: `Depois de amanhã${hora ? ` às ${hora}` : ''}`,
  };
}