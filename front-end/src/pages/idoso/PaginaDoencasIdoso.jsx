import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useDoencas } from "../../hooks/useDoencas";
import { useIdosoLogado } from "../../hooks/useIdosoLogado";
import logoImg from "../../assets/logo_DiaADia.png";
import DoencasListIdoso from "../../components/doencas/DoencaListIdoso";

// estilizações
import "../../components/styles/HomeIdoso.css";
import "../../components/styles/Doencas.css";
import "../../components/styles/Consultas.css";
import "../../App.css";

export default function PaginaDoencasIdoso() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // id da tabela "idoso" (e não o id do usuário)
  const { idosoId, loading: loadingIdoso } = useIdosoLogado();
  const { doencas, loading: loadingDoencas, error } = useDoencas(idosoId);

  const loading = loadingIdoso || loadingDoencas;
  const nomeIdoso = user?.nome ? user.nome.toUpperCase().split(" ")[0] : "";

  return (
    <div className="home-idoso-container">
      {/* barra de navegação */}
      <header className="home-idoso-header">
        {/* saudação */}
        <h1 className="home-idoso-titulo">Olá, {nomeIdoso}</h1>

        {/* botão da home */}
        <button
          className="home-idoso-icone-btn"
          aria-label="Início"
          onClick={() => navigate("/home-idoso")}
        >
          <i className="bi bi-house-door-fill"></i>
        </button>

        {/* botão de consultas */}
        <button
          className="home-idoso-link"
          onClick={() => navigate("/consultas-idoso")}
        >
          Consultas
        </button>

        {/* botão de medicamentos */}
        <button
          className="home-idoso-link"
          onClick={() => navigate("/medicamentos-idoso")}
        >
          Medicamentos
        </button>

        {/* botão de doenças - ATIVO */}
        <button className="home-idoso-btn-ativo">Doenças</button>

        {/* botão de notificação */}
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

      {/* corpo */}
      <div className="home-idoso-doencas">
        {loading && <p>Carregando doenças...</p>}

        {!loading && error && <p>Não foi possível carregar as doenças.</p>}

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

        {!loading && !error && doencas.length > 0 && (
          <DoencasListIdoso doencas={doencas} />
        )}
      </div>
    </div>
  );
}