import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import api, {
  logout,
  aoSessaoExpirar,
} from '../services/api/api';

import { lerJwt } from '../services/storage/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [carregando, setCarregando] = useState(true);
  const [logado, setLogado] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [user, setUser] = useState(null);
  const [erro, setErro] = useState('');

  // Busca os dados e o perfil do usuário logado
  const carregarPerfil = useCallback(async () => {
    setErro('');
    setCarregando(true);

    try {
      const { data } = await api.get('/usuario/me');

      const resultado = data?.result;
      const usuario = Array.isArray(resultado)
        ? resultado[0] ?? null
        : resultado ?? data?.usuario ?? data?.user ?? null;

      setUser(usuario);

      const role = String(usuario?.role ?? '').toLowerCase();

      if (role === 'cuidador' || role === 'idoso') {
        setPerfil(role);
      } else {
        setPerfil(null);
      }
    } catch (e) {
      setUser(null);
      setPerfil(null);
      setErro(e?.message || 'Não foi possível carregar o perfil.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    aoSessaoExpirar(() => {
      setLogado(false);
      setPerfil(null);
      setUser(null);
      setErro('');
      setCarregando(false);
    });

    lerJwt()
      .then((jwt) => {
        if (jwt) {
          setLogado(true);
          carregarPerfil();
        } else {
          setCarregando(false);
        }
      })
      .catch((e) => {
        setErro(e?.message || 'Não foi possível verificar a sessão.');
        setCarregando(false);
      });
  }, [carregarPerfil]);

  const aoLogar = useCallback(async () => {
    setLogado(true);
    await carregarPerfil();
  }, [carregarPerfil]);

  const sair = useCallback(async () => {
    await logout();

    setLogado(false);
    setPerfil(null);
    setUser(null);
    setErro('');
  }, []);

  const valor = useMemo(
    () => ({
      carregando,
      logado,
      perfil,
      user,
      erro,
      aoLogar,
      sair,
      recarregarPerfil: carregarPerfil,
    }),
    [
      carregando,
      logado,
      perfil,
      user,
      erro,
      aoLogar,
      sair,
      carregarPerfil,
    ],
  );

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return ctx;
}