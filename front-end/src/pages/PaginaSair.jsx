import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import logoImg from "../assets/logo_DiaADia.png";
import "../components/styles/HomeIdoso.css";
import "../components/styles/Sair.css";

export default function PaginaSair() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const primeiroNome = user?.nome ? user.nome.split(" ")[0] : "";

  const handleSair = () => {
    logout();
    navigate("/");
  };

  const handlePermanecer = () => {
    navigate("/home-idoso");
  };

  return (
    <div className="home-idoso-container">
      <header className="home-idoso-header">
        <h1 className="home-idoso-titulo">Olá {primeiroNome}</h1>

        <button
          className="home-idoso-icone-btn"
          aria-label="Início"
          onClick={() => navigate("/home-idoso")}
        >
          <i className="bi bi-house-door-fill"></i>
        </button>
      </header>

      <div className="sair-wrapper">
        <div className="sair-card">
          <img
            src={logoImg}
            alt="Dia a Dia Vovôs"
            className="sair-card-logo"
          />

          <h2 className="sair-card-titulo">Deseja sair da sua conta?</h2>
          <p className="sair-card-subtitulo">
            Você poderá entrar novamente a qualquer momento.
          </p>

          <div className="sair-card-acoes">
            <button className="sair-btn-permanecer" onClick={handlePermanecer}>
              Permanecer
            </button>

            <button className="sair-btn-sair" onClick={handleSair}>
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}