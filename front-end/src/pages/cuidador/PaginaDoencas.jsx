import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useDoencas } from "../../hooks/useDoencas";
import logoImg from "../../assets/logo_DiaADia.png";
import "../../components/styles/HomeIdoso.css";
import "../../components/styles/Consultas.css";

export default function PaginaDoencas() {
  const { user } = useContext(AuthContext);
  const { doencas, loading, error } = useDoencas();
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

          <button
          className="home-idoso-link"
          onClick={() => navigate("/consultas")}
        >
          Consultas
        </button>

        <button
          className="home-idoso-link"
          onClick={() => navigate("/medicamentos-idoso")}
        >
          Medicamentos
        </button>

        <button className="home-idoso-btn-ativo">Doenças</button>

        <button
          className="home-idoso-icone-btn"
          aria-label="Notificações"
          onClick={() => navigate("/notificacoes-idoso")}
        >
          <i className="bi bi-bell"></i>
        </button>
      </header>

      <div className="home-idoso-doencas">
        {loading && <p>Carregando doenças...</p>}

        {error && <p>Não foi possível carregar as doenças.</p>}

        {!loading && !error && doencas.length === 0 && (
          <div className="home-idoso-vazio">
            <img
              src={logoImg}
              alt="Dia a Dia Vovôs"
              className="home-idoso-vazio-logo"
            />
            <p className="home-idoso-vazio-texto">Nenhuma doença cadastrada</p>
          </div>
        )}

        {!loading &&
          !error &&
          doencas.map((doenca) => (
            <div className="doenca-card" key={doenca.id}>
              <h2 className="doenca-card-titulo">{doenca.nome}</h2>

              <div className="doenca-card-info">
                <p className="doenca-card-label">
                  Descrição:{" "}
                  <span className="doenca-card-valor">{doenca.descricao}</span>
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}