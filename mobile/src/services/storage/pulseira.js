import * as SecureStore from 'expo-secure-store';

const CHAVE = 'pulseira_config';

// Config guardada: { idPulseira, deviceToken, ip }
export async function lerPulseira() {
  const texto = await SecureStore.getItemAsync(CHAVE);
  return texto ? JSON.parse(texto) : null;
}

export async function salvarPulseira(config) {
  await SecureStore.setItemAsync(CHAVE, JSON.stringify(config));
}

export async function esquecerPulseira() {
  await SecureStore.deleteItemAsync(CHAVE);
}