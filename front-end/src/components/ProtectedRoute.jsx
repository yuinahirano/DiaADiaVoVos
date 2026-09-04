import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  // Exibe um loader simples enquanto o backend valida a persistência
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }
  
  // 1. Se não estiver autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // 2. Se a rota exige a propriedade de roles específicos e o usuário não possui nenhum deles
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />; // Redireciona para a Home
  }

  // Se estiver autenticado, renderiza a rota filha (<Outlet />). 
  return <Outlet />;
}