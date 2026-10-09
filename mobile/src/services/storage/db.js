import * as SQLite from 'expo-sqlite';

// Fila local (SQLite). Uma leitura da pulseira tem o formato:
// { seq, medidoEm (epoch em segundos), bpm, spo2 }

let dbPromise = null;

async function abrir() {
  const db = await SQLite.openDatabaseAsync('pulseira.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS fila (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_pulseira TEXT NOT NULL,
      seq INTEGER NOT NULL,
      medido_em INTEGER NOT NULL,
      bpm INTEGER NOT NULL,
      spo2 INTEGER NOT NULL,
      UNIQUE (id_pulseira, medido_em)
    );
  `);
  return db;
}

export function getDb() {
  if (!dbPromise) dbPromise = abrir();
  return dbPromise;
}

// Tudo numa transação: ou grava o lote inteiro ou nada.
// INSERT OR IGNORE + chave (pulseira, medido_em) evita duplicata se a pulseira reenviar.
// Retorna quantas linhas foram realmente inseridas (as ignoradas não contam).
export async function guardarNaFila(idPulseira, leituras) {
  const db = await getDb();
  let inseridas = 0;
  await db.withTransactionAsync(async () => {
    for (const l of leituras) {
      const r = await db.runAsync(
        'INSERT OR IGNORE INTO fila (id_pulseira, seq, medido_em, bpm, spo2) VALUES (?, ?, ?, ?, ?)',
        idPulseira, l.seq, l.medidoEm, l.bpm, l.spo2,
      );
      inseridas += r.changes;
    }
  });
  return inseridas;
}

export async function lerFila(idPulseira, limite) {
  const db = await getDb();
  return db.getAllAsync(
    'SELECT id, medido_em, bpm, spo2 FROM fila WHERE id_pulseira = ? ORDER BY medido_em LIMIT ?',
    idPulseira, limite,
  );
}

export async function removerDaFila(ids) {
  if (ids.length === 0) return;
  const db = await getDb();
  const marcadores = ids.map(() => '?').join(', ');
  await db.runAsync(`DELETE FROM fila WHERE id IN (${marcadores})`, ...ids);
}

export async function contarFila() {
  const db = await getDb();
  const linha = await db.getFirstAsync('SELECT COUNT(*) AS total FROM fila');
  return linha?.total ?? 0;
}

// Debug: mostra as primeiras leituras da fila
export async function verFila(limite = 10) {
  const db = await getDb();
  return db.getAllAsync(
    'SELECT id, seq, medido_em, bpm, spo2 FROM fila ORDER BY medido_em LIMIT ?',
    limite,
  );
}

// Apaga toda a fila local (as leituras já enviadas continuam no banco da API)
export async function limparFila() {
  const db = await getDb();
  await db.runAsync('DELETE FROM fila');
}