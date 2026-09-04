import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const {
    user,
    logout,
    isCuidador,
    isIdoso
  } = useContext(AuthContext);

  const navigate = useNavigate();

  return (
    <div className="container mt-4">

      {/* Cabeçalho */}
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded shadow-sm text-dark">
        <div>
          <h4 className="mb-0">
            Olá, {user?.nome}!
          </h4>

          <small className="text-muted">
            Perfil: <strong>{user?.role}</strong>
          </small>
        </div>

        <button
          className="btn btn-outline-danger btn-sm"
          onClick={logout}
        >
          Sair
        </button>
      </div>

      <h1 className="mb-4">
        Bem-vindo!
      </h1>

      {/* Botões */}
      <div className="d-flex gap-2">

        <button
          className={`btn btn-${theme === "light" ? "dark" : "light"}`}
          onClick={toggleTheme}
        >
          Alternar Tema
        </button>

        {/* Cuidador */}
        {isCuidador && (
          <button
            className="btn btn-success"
            onClick={() => navigate("/cuidador-dashboard")}
          >
            👨‍⚕️ Painel do Cuidador
          </button>
        )}

        {/* Idoso */}
        {isIdoso && (
          <button
            className="btn btn-warning"
            onClick={() => navigate("/idoso-dashboard")}
          >
            👴 Meu Painel
          </button>
        )}

      </div>

    </div>
  );
}