import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import "../components/styles/HomeIdoso.css";

export default function PaginaHomeIdoso() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const primeiroNome = user?.nome ? user.nome.split(" ")[0] : "";

  return (
    <div className="home-idoso-container">
      <header className="home-idoso-header">
        <h1 className="home-idoso-titulo">Olá {primeiroNome}</h1>

        <button className="home-idoso-icone-btn" aria-label="Início">
          <i className="bi bi-house-door-fill"></i>
        </button>

        <button className="home-idoso-link" onClick={() => navigate("/consultas")}>
          Consultas
        </button>

        <button className="home-idoso-link" onClick={() => navigate("/medicamentos-idoso")}>
          Medicamentos
        </button>

        <button className="home-idoso-icone-btn" aria-label="Notificações">
          <i className="bi bi-bell"></i>
        </button>
      </header>

      <div className="home-idoso-menu">
        <button
          className="home-idoso-menu-card home-idoso-menu-card-consultas"
          onClick={() => navigate("/consultas")}
        >
          <i className="bi bi-chat-square-heart"></i>
          <span>Consultas</span>
        </button>

        <button
          className="home-idoso-menu-card home-idoso-menu-card-medicamentos"
          onClick={() => navigate("/medicamentos-idoso")}
        >
          <i className="bi bi-capsule"></i>
          <span>Medicamentos</span>
        </button>
      </div>
    </div>
  );
}