import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, loading, semRole } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Identifica o perfil do usuário em qualquer propriedade possível e converte para minúsculas
  const rawRole =
    user?.role ||
    user?.tipo ||
    user?.tipoUsuario ||
    user?.tipo_usuario ||
    user?.perfil ||
    "";

  const userRole = String(rawRole).trim().toLowerCase();

  if (semRole && !userRole) {
    return <Navigate to="/tipo-usuario" replace />;
  }

  // Normaliza a lista de papéis permitidos para minúsculas
  if (allowedRoles && allowedRoles.length > 0) {
    const rolesFormatados = allowedRoles.map((r) => String(r).trim().toLowerCase());

    if (!userRole || !rolesFormatados.includes(userRole)) {
      console.warn("Acesso negado no ProtectedRoute:", {
        userRoleEncontrado: userRole,
        rolesPermitidos: rolesFormatados,
      });

      // Redireciona para a Home correta do usuário em vez de mandar direto pro Login
      if (userRole === "cuidador") {
        return <Navigate to="/home-cuidador" replace />;
      }
      if (userRole === "idoso") {
        return <Navigate to="/home-idoso" replace />;
      }

      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}