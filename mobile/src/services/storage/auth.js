import * as SecureStore from 'expo-secure-store';

const CHAVE = 'jwt';

export async function lerJwt() {
  return SecureStore.getItemAsync(CHAVE);
}

export async function salvarJwt(token) {
  await SecureStore.setItemAsync(CHAVE, token);
}

export async function apagarJwt() {
  await SecureStore.deleteItemAsync(CHAVE);
}