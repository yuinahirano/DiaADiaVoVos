import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useConsultas } from "../../hooks/useConsultas";
import { useIdosoSelecionado } from "../../hooks/useIdosoSelecionado";
import logoImg from "../../assets/logo_DiaADia.png";
import CadastrarConsulta from "./PaginaAddConsulta";

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
  const { consultas, loading, error, refetch } = useConsultas(idoso?.id);
  const navigate = useNavigate();
  const nomeIdoso = loadingIdoso ? "Carregando..." : idoso?.nome || "Idoso";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consultaEditando, setConsultaEditando] = useState(null);

  const handleAbrirCadastro = () => {
    setConsultaEditando(null);
    setIsModalOpen(true);
  };

  const handleAbrirEdicao = (consulta) => {
    setConsultaEditando(consulta);
    setIsModalOpen(true);
  };

  const handleFecharModal = () => {
    setIsModalOpen(false);
    setConsultaEditando(null);
    refetch();}
  // // Handlers para exclusão e edição de consultas
  const handleDelete = (id) => {
    console.log("Deletar consulta:", id);
  };

  // const handleEdit = (consulta) => {
  //   console.log("Editar consulta:", consulta);
  // };

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

        {/* barra de navegação e seus botões */}
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

        <button
          className="home-idoso-icone-btn"
          aria-label="Notificações"
          onClick={() => navigate("/notificacoes-idoso")}
          style={styles.notifyButton}
        >
          <i className="bi bi-bell"></i>
        </button>
      </header>

      {/* botão de adicionar consulta */}
      <div style={styles.actionRow}>
        <button style={styles.addButton} onClick={handleAbrirCadastro}>
          <span style={styles.addIcon}>+</span>
          Adicionar consulta
        </button>
      </div>

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
          onEdit={handleAbrirEdicao}
        />
        )}
      </div>

      {/* modal de cadastro/edição */}
      <CadastrarConsulta
        isOpen={isModalOpen}
        onClose={handleFecharModal}
        consultaEditando={consultaEditando}
      />
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
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "25px",
    marginBottom: "10px",
  },
  addButton: {
    backgroundColor: "#FFE866",
    color: "#000000",
    border: "none",
    borderRadius: "25px",
    padding: "10px 24px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    outline: "none",
  },
  addIcon: {
    fontSize: "20px",
    fontWeight: "bold",
    lineHeight: "1",
  },
};