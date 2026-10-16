import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const IdosoSelecionadoContext = createContext(null);

// Guarda o idoso em que o cuidador tocou na home.
// Objeto completo: { id, id_usuario, id_vinculo, nome, contato_emergencia }
export function IdosoSelecionadoProvider({ children }) {
  const [idosoSelecionado, setIdosoSelecionado] = useState(null);

  const selecionarIdoso = useCallback(
    (idoso) => setIdosoSelecionado(idoso ?? null),
    [],
  );

  const limparIdoso = useCallback(() => setIdosoSelecionado(null), []);

  const valor = useMemo(
    () => ({ idosoSelecionado, selecionarIdoso, limparIdoso }),
    [idosoSelecionado, selecionarIdoso, limparIdoso],
  );

  return (
    <IdosoSelecionadoContext.Provider value={valor}>
      {children}
    </IdosoSelecionadoContext.Provider>
  );
}

export function useIdosoSelecionado() {
  const ctx = useContext(IdosoSelecionadoContext);

  if (!ctx) {
    throw new Error(
      'useIdosoSelecionado precisa estar dentro de <IdosoSelecionadoProvider>',
    );
  }

  return ctx;
}