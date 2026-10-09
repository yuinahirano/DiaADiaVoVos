import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useConsultas } from "../../hooks/useConsultas";
import { useIdosoSelecionado } from "../../hooks/useIdosoSelecionado";
import logoImg from "../../assets/logo_DiaADia.png";
import PaginaHomeCuidador from '../../pages/cuidador/PaginaHomeCuidador';

//estilizações
import "../../components/styles/HomeIdoso.css";
import "../../components/styles/Doencas.css";
import "../../components/styles/Consultas.css";

import ConsultasList from "../../components/consultas/ConsultasList";

function formatarData(data) {
  if (!data) return null;
  const dataConvertida = new Date(data);
  if (isNaN(dataConvertida.getTime())) return null;
  return dataConvertida.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default function PaginaConsultas() {
  const { user } = useContext(AuthContext);
  const { idoso, loading: loadingIdoso } = useIdosoSelecionado();
  const { consultas, loading, error } = useConsultas(idoso?.id);
  const navigate = useNavigate();
  //const primeiroNome = user?.nome ? user.nome.split(" ")[0] : "";
  const nomeIdoso = loadingIdoso ? "Carregando..." : idoso?.nome || "Idoso";

  // Handlers para exclusão e edição de consultas
  const handleDelete = (id) => {
    console.log("Deletar consulta:", id);
  };

  const handleEdit = (consulta) => {
    console.log("Editar consulta:", consulta);
  };

  return (
    <div className="consultas-container">
      <header className="home-idoso-header">

        {/* botão de voltar */}
        <button
          className="home-idoso-icone-btn"
          aria-label="Voltar"
          onClick={() => navigate("/home-cuidador")}
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
          onClick={() => navigate("/medicamentos")}
        >
          Medicamentos
        </button>

        <button
          className="home-idoso-link"
          onClick={() => navigate("/registro-saude")}
        >
          Registro Saúde
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

        {/* chamando os componentes com a listagem */}
        {!loading && !error && consultas.length > 0 && (
        <ConsultasList
          consultas={consultas}
          formatarData={formatarData}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
        )}
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