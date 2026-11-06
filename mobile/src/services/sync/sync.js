import { testarPulseira, lerLeituras, confirmarLeituras } from '../http/pulseiraHttp';
import { MAX_LOTE } from '../api/config';
import { contarFila, guardarNaFila, lerFila, removerDaFila } from '../storage/db';
import { enviarLote } from '../api/api';
import { lerPulseira } from '../storage/pulseira';

let emAndamento = false;

// 1º de nov/2023: qualquer epoch menor que isso indica ESP32 sem horário sincronizado (NTP)
const EPOCH_MINIMO = 1698796800;

function leituraValida(l) {
  return (
    l &&
    Number.isFinite(l.seq) &&
    Number.isFinite(l.medidoEm) &&
    l.medidoEm > EPOCH_MINIMO &&
    Number.isFinite(l.bpm) &&
    Number.isFinite(l.spo2)
  );
}

// Envia a fila para a API em lotes. Só apaga do SQLite depois de uma resposta 200/201.
// Qualquer falha (sem internet, 401, 5xx) lança erro e a fila continua intacta;
// o reenvio não duplica porque a API tem chave única (pulseira, medido_em).
export async function enviarFila(aoAtualizar) {
  const cfg = await lerPulseira();
  if (!cfg) return 0;

  let total = 0;
  for (;;) {
    const linhas = await lerFila(cfg.idPulseira, MAX_LOTE);
    if (linhas.length === 0) break;

    const resposta = await enviarLote(
      cfg.deviceToken,
      linhas.map((l) => ({
        medidoEm: new Date(l.medido_em * 1000).toISOString(),
        bpm: l.bpm,
        spo2: l.spo2,
      })),
    );

    aoAtualizar?.(`API: ${JSON.stringify(resposta)}`);

    await removerDaFila(linhas.map((l) => l.id));
    total += linhas.length;
  }
  return total;
}

// Retorna { recebidas, enviadas, naFila, erroEnvio? }
export async function sincronizarAgora(aoAtualizar) {
  if (emAndamento) throw new Error('Já existe uma sincronização em andamento');
  emAndamento = true;

  try {
    const cfg = await lerPulseira();
    if (!cfg) throw new Error('Nenhuma pulseira vinculada');

    await testarPulseira(cfg.ip); // lança erro se a pulseira não estiver acessível

    // A pulseira entrega até 100 leituras por vez. Cada lote é guardado no SQLite
    // e só então confirmado (a pulseira apaga). Se a confirmação falhar, o próximo
    // ciclo reenvia e o INSERT OR IGNORE evita duplicata.
    let recebidas = 0;
    for (;;) {
      const leituras = await lerLeituras(cfg.ip);
      if (!Array.isArray(leituras)) {
        throw new Error(`Resposta inesperada de /leituras: ${JSON.stringify(leituras).slice(0, 200)}`);
      }
      if (leituras.length === 0) break;

      // Não confirma (não apaga na pulseira) se o formato estiver errado
      const invalida = leituras.find((l) => !leituraValida(l));
      if (invalida) {
        throw new Error(
          `Leitura inválida da pulseira (campos seq, medidoEm em epoch s, bpm, spo2): ${JSON.stringify(invalida)}`,
        );
      }

      const inseridas = await guardarNaFila(cfg.idPulseira, leituras);
      if (inseridas < leituras.length) {
        aoAtualizar?.(`${leituras.length - inseridas} leitura(s) já estavam na fila (duplicadas)`);
      }

      await confirmarLeituras(cfg.ip, Math.max(...leituras.map((l) => l.seq)));
      recebidas += leituras.length;

      if (leituras.length < 100) break;
    }

    let enviadas = 0;
    let erroEnvio;
    try {
      enviadas = await enviarFila(aoAtualizar);
    } catch (e) {
      erroEnvio = e.message; // fila mantida; tenta de novo no próximo ciclo
    }

    return { recebidas, enviadas, naFila: await contarFila(), erroEnvio };
  } finally {
    emAndamento = false;
  }
}

// Enquanto o app está aberto: a cada intervalo busca na pulseira e sincroniza.
// Mesmo sem a pulseira acessível, tenta esvaziar a fila (caso a internet tenha voltado).
// Retorna uma função para parar.
export function iniciarAutomatico(aoAtualizar, intervaloMs = 60000) {
  let ativo = true;
  let timer = null;

  const ciclo = async () => {
    try {
      const r = await sincronizarAgora(aoAtualizar);
      aoAtualizar(
        `Recebidas ${r.recebidas}, enviadas ${r.enviadas}, na fila ${r.naFila}` +
          (r.erroEnvio ? ` (envio falhou: ${r.erroEnvio})` : ''),
      );
    } catch (e) {
      aoAtualizar(e.message);
      try {
        const n = await enviarFila(aoAtualizar);
        if (n > 0) aoAtualizar(`Fila enviada: ${n} leituras`);
      } catch (e2) {
        aoAtualizar(`Envio da fila falhou: ${e2.message}`);
      }
    } finally {
      if (ativo) timer = setTimeout(ciclo, intervaloMs);
    }
  };

  ciclo();
  return () => {
    ativo = false;
    if (timer) clearTimeout(timer);
  };
}