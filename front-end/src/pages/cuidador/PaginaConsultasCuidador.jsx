import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useConsultas } from "../../hooks/useConsultas";
import { useIdosoSelecionado } from "../../hooks/useIdosoSelecionado";
import logoImg from "../../assets/logo_DiaADia.png";
import CadastrarConsulta from "./PaginaAddConsulta";
import { deleteConsulta } from "../../service/idosoApi";

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
  const nomeIdoso = loadingIdoso ? "Carregando..." : idoso?.nome || "Idoso";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [consultaEditando, setConsultaEditando] = useState(null);

  const handleAbrirCadastro = () => {
    navigate("/consultas/nova");
  };

  const handleAbrirEdicao = (consulta) => {
    navigate("/consultas/editar", { state: { consulta } });
  };

  const handleFecharModal = () => {
    setIsModalOpen(false);
    setConsultaEditando(null);
    refetch();
  };
  // // Handlers para exclusão e edição de consultas
  const handleDelete = (id) => {
    try {
      deleteConsulta(id);

      refetch();

      setSucesso(true);
    } catch (erro) {
      console.error("Erro ao excluir consulta:", erro);
      alert("Não foi possível excluir a consulta. Tente novamente.");
    }
  };

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

        {/* botão de consultas */}
        <button className="home-idoso-btn-ativo">Consulta</button>

        {/* botão de medicamentos */}
        <button
          className="home-idoso-link"
          onClick={() => navigate("/medicamentos")}
        >
          Medicamentos
        </button>

        {/* botão de registro de saúde */}
        <button
          className="home-idoso-link"
          onClick={() => navigate("/registro-saude")}
        >
          Registro Saúde
        </button>

        {/* botão de notificação */}
        <button
          className="home-idoso-icone-btn"
          aria-label="Notificações"
          onClick={() => navigate("/notificacoes-idoso")}
          style={styles.notifyButton}
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

      {/* MODAL DE SUCESSO */}
      {sucesso && (
        <div style={styles.innerModalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Sucesso!</h2>

            <p style={styles.modalText}>A consulta foi excluída com sucesso.</p>

            <button
              onClick={() => setSucesso(false)}
              style={styles.modalButton}
            >
              OK
            </button>
          </div>
        </div>
      )}
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
  innerModalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: "32px",
    borderRadius: "24px",
    width: "90%",
    maxWidth: "400px",
    textAlign: "center",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
  },

  modalTitle: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "16px",
    color: "#333333",
  },

  modalText: {
    fontSize: "16px",
    color: "#555555",
    marginBottom: "24px",
  },

  modalButton: {
    backgroundColor: "#FFE866",
    color: "#000000",
    border: "none",
    borderRadius: "20px",
    padding: "12px 32px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
