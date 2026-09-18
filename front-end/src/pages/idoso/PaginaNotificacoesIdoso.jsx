import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useNotificacoesIdoso } from "../../hooks/useNotificacoesIdoso";
import logoImg from "../assets/logo_DiaADia.png";
import "../components/styles/HomeIdoso.css";
import "../components/styles/Consultas.css";

function formatarData(dataIso) {
  const data = new Date(dataIso);

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarStatus(status) {
  const mapa = {
    aceita: "Aceita",
    pendente: "Pendente",
    recusada: "Recusada",
    cancelada: "Cancelada",
  };

  return mapa[status] || status;
}

export default function PaginaNotificacoesIdoso() {
  const { user } = useContext(AuthContext);
  const { notificacoes, loading, error, aceitar, recusar, limparSolicitacoes } =
    useNotificacoesIdoso();

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

        <button
          className="home-idoso-icone-btn home-idoso-icone-btn-ativo"
          aria-label="Notificações"
        >
          <i className="bi bi-bell-fill"></i>
        </button>
      </header>

      <div className="home-idoso-consultas">
        {!loading && !error && notificacoes.length > 0 && (
          <div className="notificacoes-acoes">
            <button
              className="notificacoes-btn-limpar"
              onClick={limparSolicitacoes}
            >
              <i className="bi bi-trash3"></i>
              Limpar notificações
            </button>
          </div>
        )}

        {loading && <p>Carregando notificações...</p>}

        {error && <p>Não foi possível carregar as notificações.</p>}

        {!loading && !error && notificacoes.length === 0 && (
          <div className="home-idoso-vazio">
            <img
              src={logoImg}
              alt="Dia a Dia Vovôs"
              className="home-idoso-vazio-logo"
            />

            <p className="home-idoso-vazio-texto">
              Nenhuma notificação no momento
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          notificacoes.map((notificacao) => (
            <div className="consulta-card" key={notificacao.id}>
              <h2 className="consulta-card-titulo">Solicitação de cuidador</h2>

              <div className="consulta-card-info">
                <p className="consulta-card-label">
                  Status:{" "}
                  <span className="consulta-card-valor">
                    {formatarStatus(notificacao.status)}
                  </span>
                </p>

                <p className="consulta-card-label">
                  Contato de emergência:{" "}
                  <span className="consulta-card-valor">
                    {notificacao.contato_emergencia || "Não informado"}
                  </span>
                </p>

                <p className="consulta-card-label">
                  Expira em:{" "}
                  <span className="consulta-card-valor">
                    {formatarData(notificacao.expira_em)}
                  </span>
                </p>
              </div>

              {notificacao.status === "pendente" && (
                <div className="consulta-card-acoes">
                  <button
                    className="notificacao-btn-aceitar"
                    onClick={() => aceitar(notificacao.id)}
                  >
                    Aceitar
                  </button>

                  <button
                    className="notificacao-btn-recusar"
                    onClick={() => recusar(notificacao.id)}
                  >
                    Recusar
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
