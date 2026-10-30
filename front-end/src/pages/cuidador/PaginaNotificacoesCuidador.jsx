import { useNavigate } from "react-router-dom";
import { useNotificacoesCuidador } from "../../hooks/useNotificacoesCuidador";
import logoImg from "../../assets/logo_DiaADia.png";

//estilizações
import "../../components/styles/HomeIdoso.css";
import "../../components/styles/Consultas.css";
import "../../components/styles/Notificacao.css";

function formatarData(dataIso) {
  if (!dataIso) return "Não informado";
  const data = new Date(dataIso);
  if (isNaN(data.getTime())) return "Não informado";

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

export default function PaginaNotificacoesCuidador() {
  const navigate = useNavigate();
  const { notificacoes, loading, error, cancelar } = useNotificacoesCuidador();

  const handleCancelar = async (id) => {
    try {
      await cancelar(id);
    } catch (erro) {
      console.error("Erro ao cancelar solicitação:", erro);
      alert("Não foi possível cancelar a solicitação. Tente novamente.");
    }
  };

  return (
    <div className="home-idoso-container">
      <header className="home-idoso-header">
        {/* botão de voltar */}
        <button
          className="home-idoso-icone-btn"
          aria-label="Voltar"
          onClick={() => navigate("/home-cuidador")}
          style={styles.yellowButton}
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        {/* título */}
        <h1 className="home-idoso-titulo">Notificações</h1>

        {/* botão de notificação (página atual) */}
        <button
          className="home-idoso-icone-btn"
          aria-label="Notificações"
          style={styles.yellowButton}
        >
          <i className="bi bi-bell-fill"></i>
        </button>

        {/* botão de sair */}
        <button
          className="home-idoso-icone-btn"
          aria-label="Sair"
          onClick={() => navigate("/sair")}
        >
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </header>

      <div className="home-idoso-consultas">
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
            <div className="notificacao-card" key={notificacao.id}>
              <h2 className="notificacao-card-titulo">
                Solicitação enviada
              </h2>

              <div className="notificacao-card-info">
                <p className="notificacao-card-label">
                  Status:{" "}
                  <span className="notificacao-card-valor">
                    {formatarStatus(notificacao.status)}
                  </span>
                </p>

                <p className="notificacao-card-label">
                  Contato de emergência:{" "}
                  <span className="notificacao-card-valor">
                    {notificacao.contato_emergencia || "Não informado"}
                  </span>
                </p>

                <p className="notificacao-card-label">
                  Expira em:{" "}
                  <span className="notificacao-card-valor">
                    {formatarData(notificacao.expira_em)}
                  </span>
                </p>
              </div>

              {notificacao.status === "pendente" && (
                <div className="notificacao-card-acoes">
                  <button
                    className="notificacao-btn-recusar"
                    onClick={() => handleCancelar(notificacao.id)}
                  >
                    Cancelar solicitação
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

const styles = {
  yellowButton: {
    backgroundColor: "#FFE866",
    color: "#000000",
  },
};