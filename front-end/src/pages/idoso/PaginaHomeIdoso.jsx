import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import "../../App.css";

export default function PaginaHomeIdoso() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const primeiroNome = user?.nome ? user.nome.split(" ")[0] : "";

  return (
    <div className="home-idoso-container">

      {/* barra de navegação */}
      <header className="home-idoso-header">

{/* saudação */}
        <h1 className="home-idoso-titulo">Olá {primeiroNome}</h1>

{/* botão de sair */}
        <button
          className="home-idoso-icone-btn"
          aria-label="Sair"
          onClick={() => navigate("/sair")}
        >
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </header>

      <div className="home-idoso-menu">
        <button
          className="home-idoso-menu-card home-idoso-menu-card-consultas"
          onClick={() => navigate("/consultas-idoso")}
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

        <button
          className="home-idoso-menu-card home-idoso-menu-card-doencas"
          onClick={() => navigate("/doencas-idoso")}
        >
          <i className="bi bi-clipboard2-pulse"></i>
          <span>Doenças</span>
        </button>

        <button
          className="home-idoso-menu-card home-idoso-menu-card-notificacoes"
          onClick={() => navigate("/notificacoes-idoso")}
        >
          <i className="bi bi-bell"></i>
          <span>Notificações</span>
        </button>
      </div>
    </div>
  );
}