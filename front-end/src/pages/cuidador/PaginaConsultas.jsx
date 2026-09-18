import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useConsultas } from "../../hooks/useConsultas";
import logoImg from "../assets/logo_DiaADia.png";
import "../components/styles/HomeIdoso.css";
import "../components/styles/Consultas.css";

export default function PaginaConsultas() {
  const { user } = useContext(AuthContext);
  const { consultas, loading, error } = useConsultas();
  const navigate = useNavigate();
  const primeiroNome = user?.nome ? user.nome.split(" ")[0] : "";

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

        <button className="home-idoso-btn-ativo">Consultas</button>

        <button
          className="home-idoso-link"
          onClick={() => navigate("/medicamentos-idoso")}
        >
          Medicamentos
        </button>

        <button
          className="home-idoso-link"
          onClick={() => navigate("/doencas")}
        >
          Doenças
        </button>

        <button
          className="home-idoso-icone-btn"
          aria-label="Notificações"
          onClick={() => navigate("/notificacoes-idoso")}
        >
          <i className="bi bi-bell"></i>
        </button>
      </header>

      <div className="home-idoso-consultas">
        {loading && <p>Carregando consultas...</p>}

        {error && <p>Não foi possível carregar as consultas.</p>}

        {!loading && !error && consultas.length === 0 && (
          <div className="home-idoso-vazio">
            <img
              src={logoImg}
              alt="Dia a Dia Vovôs"
              className="home-idoso-vazio-logo"
            />
            <p className="home-idoso-vazio-texto">Nenhuma consulta marcada</p>
          </div>
        )}

        {!loading &&
          !error &&
          consultas.map((consulta) => (
            <div className="consulta-card" key={consulta.id}>
              <h2 className="consulta-card-titulo">{consulta.nome_medico}</h2>

              <div className="consulta-card-info">
                <p className="consulta-card-label">
                  Horário:{" "}
                  <span className="consulta-card-valor">
                    {consulta.horario}
                  </span>
                </p>

                <p className="consulta-card-label">
                  Local:{" "}
                  <span className="consulta-card-valor">
                    {consulta.local_consulta}
                  </span>
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}