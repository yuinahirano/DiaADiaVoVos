import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function RedirectHome() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (user?.role === "idoso") return <Navigate to="/home-idoso" replace />;
  if (user?.role === "cuidador") return <Navigate to="/medicamentos" replace />;
  return <Navigate to="/" replace />;
}