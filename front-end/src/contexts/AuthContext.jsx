import { createContext, useEffect, useState } from "react";
import { getMeRequest, loginRequest } from "../service/userApi";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storedToken = localStorage.getItem("@DiaADiaVoVos:token");
      const storedUser = localStorage.getItem("@DiaADiaVoVos:user");

      if (storedToken && storedUser) {
        try {
          const data = await getMeRequest();
          setUser(data.result[0]); 
        } catch (error) {
          logout();
        }
      }

      setLoading(false);
    }

    loadStorageData();
  }, []);

  async function login(email, password) {
    const response = await loginRequest(email, password);
    const token = response.login.token;

    // Salva o token primeiro, para que o interceptor do axios
    // já consiga usá-lo na próxima chamada (/usuario/me)
    localStorage.setItem("@DiaADiaVoVos:token", token);

    // Busca os dados do usuário logado (o login não retorna isso)
    const meData = await getMeRequest();
    const loggedUser = meData.result[0]; 
    setUser(loggedUser);
    localStorage.setItem("@DiaADiaVoVos:user", JSON.stringify(loggedUser));

    return { user: loggedUser };
  }

  function logout() {
    localStorage.removeItem("@DiaADiaVoVos:token");
    localStorage.removeItem("@DiaADiaVoVos:user");

    setUser(null);
  }

  const isCuidador = user?.role === "cuidador";
  const isIdoso = user?.role === "idoso";

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login,
        logout,
        loading,
        isCuidador,
        isIdoso,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}