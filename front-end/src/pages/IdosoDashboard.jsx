import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function IdosoDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="container mt-5 text-center">
      <h1>Seja bem-vindo, Idoso!</h1>

      {user?.nome && (
        <p className="mt-2">
          Olá, {user.nome}!
        </p>
      )}

      <div className="d-flex justify-content-center gap-2 mt-4">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/home")}
        >
          Voltar para Home
        </button>

        <button
          className="btn btn-danger"
          onClick={handleLogout}
        >
          Sair
        </button>
      </div>
    </div>
  );
}