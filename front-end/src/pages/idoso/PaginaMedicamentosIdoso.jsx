import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useMedicamentosIdoso } from "../../hooks/useMedicamentosIdoso";
import logoImg from "../../assets/logo_DiaADia.png";
import "../../components/styles/HomeIdoso.css";
import "../../components/styles/Consultas.css";

export default function PaginaMedicamentosIdoso() {
  const { user } = useContext(AuthContext);
  const { medicamentos, loading, error } = useMedicamentosIdoso();
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

        <button className="home-idoso-btn-ativo">Medicamentos</button>

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
        {loading && <p>Carregando medicamentos...</p>}

        {error && <p>Não foi possível carregar os medicamentos.</p>}

        {!loading && !error && medicamentos.length === 0 && (
          <div className="home-idoso-vazio">
            <img
              src={logoImg}
              alt="Dia a Dia Vovôs"
              className="home-idoso-vazio-logo"
            />
            <p className="home-idoso-vazio-texto">
              Nenhum medicamento cadastrado
            </p>
          </div>
        )}
        {!loading &&
          !error &&
          medicamentos.map((medicamento) => (
            <div className="consulta-card" key={medicamento.id}>
              <h2 className="consulta-card-titulo">{medicamento.nome}</h2>

              <div className="consulta-card-info">
                <p className="consulta-card-label">
                  Dosagem:{" "}
                  <span className="consulta-card-valor">
                    {medicamento.dosagem}
                  </span>
                </p>

                <p className="consulta-card-label">
                  Horário:{" "}
                  <span className="consulta-card-valor">
                    {medicamento.horario}
                  </span>
                </p>

                <p className="consulta-card-label">
                  Frequência:{" "}
                  <span className="consulta-card-valor">
                    {medicamento.frequencia}
                  </span>
                </p>

                <p className="consulta-card-label">
                  Observações:{" "}
                  <span className="consulta-card-valor">
                    {medicamento.observacoes}
                  </span>
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}