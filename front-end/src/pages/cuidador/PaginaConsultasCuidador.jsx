import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useConsultas } from "../../hooks/useConsultas";
import { useIdosoSelecionado } from "../../hooks/useIdosoSelecionado";
import { deleteConsulta } from "../../service/idosoApi";
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
  const [idParaDeletar, setIdParaDeletar] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

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
    refetch();
  };

  // abre a confirmação de exclusão
  const handleDelete = (id) => {
    setIdParaDeletar(id);
  };

  // confirma e exclui de verdade
  const handleConfirmarDeletar = async () => {
    if (!idParaDeletar || excluindo) return;

    setExcluindo(true);
    try {
      await deleteConsulta(idParaDeletar);
      setIdParaDeletar(null);
      refetch();
    } catch (erro) {
      console.error("Erro ao excluir consulta:", erro);
      alert("Não foi possível excluir a consulta. Tente novamente.");
    } finally {
      setExcluindo(false);
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
          onClick={() => navigate("/notificacoes-cuidador")}
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

      {/* confirmação de exclusão */}
      {idParaDeletar && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3>Tem certeza que deseja excluir?</h3>
            <p>Esta ação não poderá ser desfeita.</p>
            <div style={styles.modalButtons}>
              <button
                style={styles.cancelBtn}
                onClick={() => setIdParaDeletar(null)}
                disabled={excluindo}
              >
                Cancelar
              </button>
              <button
                style={styles.confirmBtn}
                onClick={handleConfirmarDeletar}
                disabled={excluindo}
              >
                {excluindo ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
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
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalBox: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "20px",
    textAlign: "center",
    maxWidth: "400px",
    width: "90%",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "20px",
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  confirmBtn: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#ff4d4d",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
};