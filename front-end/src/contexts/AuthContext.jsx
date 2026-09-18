import { createContext, useEffect, useState } from "react";
import { getMeRequest, loginRequest } from "../service/userApi";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("@DiaADiaVoVos:user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storedToken = localStorage.getItem("@DiaADiaVoVos:token");

      if (storedToken) {
        try {
          const data = await getMeRequest();
          const loggedUser = data?.result
            ? Array.isArray(data.result)
              ? data.result[0]
              : data.result
            : data;

          if (loggedUser) {
            setUser(loggedUser);
            localStorage.setItem("@DiaADiaVoVos:user", JSON.stringify(loggedUser));

            if (loggedUser?.id) {
              localStorage.setItem("usuarioId", String(loggedUser.id));
            }
          }
        } catch (error) {
          console.error("Mantendo sessão local devido a erro na API:", error);
        }
      } else {
        logout();
      }

      setLoading(false);
    }

    loadStorageData();
  }, []);

  async function login(email, password) {
    const response = await loginRequest(email, password);
    const token = response.login?.token || response.token;

    if (token) {
      localStorage.setItem("@DiaADiaVoVos:token", token);
    }

    const meData = await getMeRequest();
    const loggedUser = meData?.result
      ? Array.isArray(meData.result)
        ? meData.result[0]
        : meData.result
      : meData;

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
    localStorage.removeItem("idosoSelecionadoId");
    setUser(null);
  }

  // Extrai o papel normalizando caixa alta/baixa
  const rawRole =
    user?.role ||
    user?.tipo ||
    user?.tipoUsuario ||
    user?.tipo_usuario ||
    user?.perfil ||
    "";

  const userRoleNormalized = String(rawRole).trim().toLowerCase();

  const isCuidador = userRoleNormalized === "cuidador";
  const isIdoso = userRoleNormalized === "idoso";
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