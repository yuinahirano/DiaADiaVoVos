import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

// Paletas de cores. Os cards pastéis são iguais nos dois temas,
// com texto preto, para manter o alto contraste.
export const TEMAS = {
  claro: {
    escuro: false,
    fundo: '#EAF1FF',
    texto: '#000000',
    textoSecundario: '#333333',
    superficie: '#FFFFFF',
    botaoHeader: '#FFFFFF',
    borda: '#000000',
    skeleton: '#D3DCEE',
    statusBar: 'dark-content',
    cards: ['#FFE16A', '#F5B4C5', '#C8ACE4', '#F5877E', '#A6D8B7'],
  },
  escuro: {
    escuro: true,
    fundo: '#121826',
    texto: '#FFFFFF',
    textoSecundario: '#C9D1E3',
    superficie: '#1E2638',
    botaoHeader: '#232C42',
    borda: '#FFFFFF',
    skeleton: '#2A3550',
    statusBar: 'light-content',
    cards: ['#FFE16A', '#F5B4C5', '#C8ACE4', '#F5877E', '#A6D8B7'],
  },
};

const TemaContext = createContext(null);

// Provedor do tema claro/escuro
export function TemaProvider({ children }) {
  const sistema = useColorScheme();
  const [escuro, setEscuro] = useState(sistema === 'dark');

  const alternar = useCallback(() => setEscuro((v) => !v), []);

  const valor = useMemo(
    () => ({
      cores: escuro ? TEMAS.escuro : TEMAS.claro,
      escuro,
      alternar,
    }),
    [escuro, alternar],
  );

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export function useTema() {
  const ctx = useContext(TemaContext);

  if (!ctx) {
    throw new Error('useTema precisa estar dentro de <TemaProvider>');
  }

  return ctx;
}