import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useMedicamentosIdoso } from "../../hooks/useMedicamentosIdoso";
import logoImg from "../../assets/logo_DiaADia.png";
import MedicamentosListIdoso from "../../components/medicamentos/MedicamentosListIdoso";

//estilização
import "../../components/styles/Medicamentos.css";

export default function PaginaMedicamentosIdoso() {
  const { user } = useContext(AuthContext);
  const { medicamentos, loading, error } = useMedicamentosIdoso();
  const navigate = useNavigate();
  const primeiroNome = user?.nome ? user.nome.toUpperCase().split(" ")[0] : "";

  return (
    <div className="medicamento-idoso-container">
      {/* barra de navegação */}
      <header className="medicamento-idoso-header">

        {/* saudação */}
        <h1 className="medicamento-idoso-titulo">Olá, {primeiroNome}</h1>

{/* botão de home */}
        <button
          className="medicamento-idoso-icone-btn"
          aria-label="Início"
          onClick={() => navigate("/home-idoso")}
        >
          <i className="bi bi-house-door-fill"></i>
        </button>

{/* botão de consultas */}
        <button
          className="medicamento-idoso-link"
          onClick={() => navigate("/consultas-idoso")}
        >
          Consultas
        </button>

{/* botão de medicamentos - ATIVO */}
        <button className="medicamento-idoso-btn-ativo">Medicamentos</button>

{/* botão de doenças */}
        <button
          className="medicamento-idoso-link"
          onClick={() => navigate("/doencas-idoso")}
        >
          Doenças
        </button>

{/* botão de notificações */}
        <button
          className="medicamento-idoso-icone-btn"
          aria-label="Notificações"
          onClick={() => navigate("/notificacoes-idoso")}
        >
          <i className="bi bi-bell"></i>
        </button>

        {/* botão de sair */}
        <button
          className="medicamento-idoso-icone-btn"
          aria-label="Sair"
          onClick={() => navigate("/sair")}
        >
          <i className="bi bi-box-arrow-right"></i>
        </button>
        
      </header>

      <div className="medicamento-idoso-consultas">
        {loading && <p>Carregando medicamentos...</p>}

        {error && <p>Não foi possível carregar os medicamentos.</p>}

        {!loading && !error && medicamentos.length === 0 && (
          <div className="medicamento-idoso-vazio">
            <img
              src={logoImg}
              alt="Dia a Dia Vovôs"
              className="medicamento-idoso-vazio-logo"
            />
            <p className="medicamento-idoso-vazio-texto">
              Nenhum medicamento cadastrado
            </p>
          </div>
        )}
        {!loading && !error && medicamentos.length > 0 && (
    <MedicamentosListIdoso medicamentos={medicamentos} />
  )}
      </div>
    </div>
  );
}