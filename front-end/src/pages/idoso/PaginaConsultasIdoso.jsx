import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useConsultas } from "../../hooks/useConsultas";
import { useIdosoSelecionado } from "../../hooks/useIdosoSelecionado";
import ConsultasListIdoso from "../../components/consultas/ConsultasListIdoso";
import logoImg from "../../assets/logo_DiaADia.png";
import "../../App.css";

//estilizações
import "../../components/styles/HomeIdoso.css";
import "../../components/styles/Doencas.css";
import "../../components/styles/Consultas.css";

function formatarData(data) {
  if (!data) return null;
  const dataConvertida = new Date(data);
  if (isNaN(dataConvertida.getTime())) return null;
  return dataConvertida.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default function PaginaConsultasIdoso() {
  const { user } = useContext(AuthContext);
  const { consultas, loading, error } = useConsultas(user?.id);
  const navigate = useNavigate();
  const nomeIdoso = user?.nome ? user.nome.toUpperCase().split(" ")[0] : "";

  return (
    <div className="home-idoso-container">
      
      {/* barra de navegação */}
      <header className="home-idoso-header">

        {/* saudação */}
        <h1 className="home-idoso-titulo">Olá, {nomeIdoso}</h1>

{/* botão de home */}
        <button className="home-idoso-icone-btn" 
        aria-label="Início"
        onClick={() => navigate("/home-idoso")}>
          <i className="bi bi-house-door-fill"></i>
        </button>

{/* botão de consultas - ATIVO */}
        <button className="home-idoso-btn-ativo">Consultas</button>

{/* botão de medicamentos */}
        <button
          className="home-idoso-link"
          onClick={() => navigate("/medicamentos-idoso")}
        >
          Medicamentos
        </button>

{/* botão de página de doenças */}
        <button
          className="home-idoso-link"
          onClick={() => navigate("/doencas-idoso")}
        >
          Doenças
        </button>

{/* botão de notificações */}
        <button
          className="home-idoso-icone-btn"
          aria-label="Notificações"
          onClick={() => navigate("/notificacoes-idoso")}
        >
          <i className="bi bi-bell"></i>
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

        {!loading && !error && consultas.length > 0 && (
    <ConsultasListIdoso consultas={consultas} formatarData={formatarData} />
  )}
      </div>
    </div>
  );
}

const styles = {
  corBotoes: {
    backgroundColor: "#FFE866",
    color: "#000000",
  },
  notifyButton: {
    backgroundColor: "#FFE866",
    color: "#000000",
  },
};