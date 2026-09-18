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
          const loggedUser = data.result[0];
          
          setUser(loggedUser);

          if (loggedUser?.id) {
            localStorage.setItem("usuarioId", String(loggedUser.id));
          }
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

    localStorage.setItem("@DiaADiaVoVos:token", token);

    const meData = await getMeRequest();
    const loggedUser = meData.result[0];
    
    setUser(loggedUser);
    localStorage.setItem("@DiaADiaVoVos:user", JSON.stringify(loggedUser));

    if (loggedUser?.id) {
      localStorage.setItem("usuarioId", String(loggedUser.id));
    }

    return { user: loggedUser };
  }

  function logout() {
    localStorage.removeItem("@DiaADiaVoVos:token");
    localStorage.removeItem("@DiaADiaVoVos:user");
    localStorage.removeItem("usuarioId");
    setUser(null);
  }

  const isCuidador = user?.role === "cuidador";
  const isIdoso = user?.role === "idoso";
  const semRole = !!user && !isCuidador && !isIdoso;

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
        semRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}