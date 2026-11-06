// Tudo vem do arquivo .env (prefixo EXPO_PUBLIC_). Reinicie o Expo com -c ao alterar.
// Sem valor padrão de propósito: se o .env não for lido, o app avisa em vez de usar um endereço errado.
export const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Quantas leituras vão em cada envio para a API
export const MAX_LOTE = Number(process.env.EXPO_PUBLIC_MAX_LOTE) || 100;

// IP da pulseira pré-preenchido na tela (opcional)
export const PULSEIRA_IP_PADRAO = process.env.EXPO_PUBLIC_PULSEIRA_IP ?? '';