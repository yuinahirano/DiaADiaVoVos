import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useConsultas } from "../../hooks/useConsultas";
import { useIdosoSelecionado } from "../../hooks/useIdosoSelecionado";
import logoImg from "../../assets/logo_DiaADia.png";

//estilizações
import "../../components/styles/HomeIdoso.css";
import "../../components/styles/Doencas.css";
import "../../components/styles/Consultas.css";

export default function PaginaConsultas() {
  const { user } = useContext(AuthContext);
  const { idoso, loading: loadingIdoso } = useIdosoSelecionado();
  const { consultas, loading, error } = useConsultas(idoso?.id);
  const navigate = useNavigate();
  //const primeiroNome = user?.nome ? user.nome.split(" ")[0] : "";
  const nomeIdoso = loadingIdoso ? "Carregando..." : idoso?.nome || "Idoso";

  return (
    <div className="consultas-container">
      <header className="home-idoso-header">

        {/* botão de voltar */}
        <button
          className="home-idoso-icone-btn"
          aria-label="Voltar"
          onClick={() => navigate(-1)}
          style={styles.backButton}
          >
          <i className="bi bi-chevron-left"></i>
        </button>

        {/* saudacao */}
        <h1 className="home-idoso-titulo">{nomeIdoso}</h1>


        {/* barra de navegação e seus botoões */}

        <button
          className="home-idoso-link"
          onClick={() => navigate("/doencas")}
        >
          Doenças
        </button>

        <button className="home-idoso-btn-ativo">Consulta</button>

        <button
          className="home-idoso-link"
          onClick={() => navigate("/medicamentos-idoso")}
        >
          Medicamentos
        </button>

        <button
          className="home-idoso-link"
          onClick={() => navigate("/registro-saude")}
        >
          Registro Saúde
        </button>

        <button
          className="home-idoso-icone-btn"
          aria-label="Notificações"
          onClick={() => navigate("/notificacoes-idoso")}
          style={styles.notifyButton}
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

const styles = {
  backButton: {
    backgroundColor: "#FFE866",
    color: "#000000",
  },
  notifyButton: {
    backgroundColor: "#FFE866",
    color: "#000000",
  },
};