import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { logout, aoSessaoExpirar, perfilDoUsuarioLogado } from '../services/api/api';
import { lerJwt } from '../services/storage/auth';

// perfil: 'cuidador' | 'idoso' | null (logado, mas sem role ou ainda não carregado)
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // true enquanto verifica o token guardado ou busca o perfil
  const [carregando, setCarregando] = useState(true);
  const [logado, setLogado] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [erro, setErro] = useState('');

  // Descobre o perfil em GET /usuario/me (campo role)
  const carregarPerfil = useCallback(async () => {
    setErro('');
    setCarregando(true);
    try {
      setPerfil(await perfilDoUsuarioLogado());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    // Token vencido: o api.js apaga o JWT e chama isto, voltando para o login
    aoSessaoExpirar(() => {
      setLogado(false);
      setPerfil(null);
      setErro('');
    });

    lerJwt().then((jwt) => {
      if (jwt) {
        setLogado(true);
        carregarPerfil();
      } else {
        setCarregando(false);
      }
    });
  }, [carregarPerfil]);

  // Chamado pelo Login depois que o JWT foi salvo
  const aoLogar = useCallback(async () => {
    setLogado(true);
    await carregarPerfil();
  }, [carregarPerfil]);

  const sair = useCallback(async () => {
    await logout();
    setLogado(false);
    setPerfil(null);
    setErro('');
  }, []);

  const valor = useMemo(
    () => ({ carregando, logado, perfil, erro, aoLogar, sair }),
    [carregando, logado, perfil, erro, aoLogar, sair],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}