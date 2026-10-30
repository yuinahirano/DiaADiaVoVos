import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useConsultas } from "../../hooks/useConsultas";
import { useIdosoSelecionado } from "../../hooks/useIdosoSelecionado";
import { deleteConsulta } from "../../service/idosoApi";
import logoImg from "../../assets/logo_DiaADia.png";
import CadastrarConsulta from "./PaginaAddConsulta";

// Estilizações
import "../../components/styles/HomeIdoso.css";
import "../../components/styles/Doencas.css";
import "../../components/styles/Consultas.css";

import ConsultasList from "../../components/consultas/ConsultasList";

// Formata a data da consulta
function formatarData(data) {
  if (!data) return null;

  const dataConvertida = new Date(data);

  if (isNaN(dataConvertida.getTime())) return null;

  return dataConvertida.toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
}

export default function PaginaConsultas() {
  const { user } = useContext(AuthContext);

  const { idoso, loading: loadingIdoso } = useIdosoSelecionado();

  const {
    consultas,
    loading,
    error,
    refetch,
  } = useConsultas(idoso?.id);

  const navigate = useNavigate();

  const nomeIdoso = loadingIdoso
    ? "Carregando..."
    : idoso?.nome || "Idoso";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [consultaEditando, setConsultaEditando] = useState(null);
  const [idParaDeletar, setIdParaDeletar] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  // Abre a página de cadastro
  const handleAbrirCadastro = () => {
    navigate("/consultas/nova");
  };

  // Abre a página de edição
  const handleAbrirEdicao = (consulta) => {
    navigate("/consultas/editar", {
      state: { consulta },
    });
  };

  // Fecha o modal de cadastro/edição
  const handleFecharModal = () => {
    setIsModalOpen(false);
    setConsultaEditando(null);
    refetch();
  };

  // Abre a confirmação de exclusão
  const handleDelete = (id) => {
    setIdParaDeletar(id);
  };

  // Confirma e exclui a consulta
  const handleConfirmarDeletar = async () => {
    if (!idParaDeletar || excluindo) return;

    setExcluindo(true);

    try {
      await deleteConsulta(idParaDeletar);

      setIdParaDeletar(null);

      await refetch();

      setSucesso(true);
    } catch (erro) {
      console.error("Erro ao excluir consulta:", erro);
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div className="consultas-container">
      {/* CABEÇALHO */}
      <header className="home-idoso-header">
        <button
          className="home-idoso-icone-btn"
          aria-label="Voltar"
          onClick={() => navigate("/home-cuidador")}
          style={styles.backButton}
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        <h1 className="home-idoso-titulo">{nomeIdoso}</h1>

        <button
          className="home-idoso-link"
          onClick={() => navigate("/doencas")}
        >
          Doenças
        </button>

        <button className="home-idoso-btn-ativo">
          Consultas
        </button>

        <button
          className="home-idoso-link"
          onClick={() => navigate("/medicamentos-cuidador")}
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
          onClick={() => navigate("/notificacoes-cuidador")}
          style={styles.notifyButton}
        >
          <i className="bi bi-bell"></i>
        </button>

        <button
          className="home-idoso-icone-btn"
          aria-label="Sair"
          onClick={() => navigate("/sair")}
        >
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </header>

      {/* BOTÃO DE ADICIONAR CONSULTA */}
      <div style={styles.actionRow}>
        <button
          style={styles.addButton}
          onClick={handleAbrirCadastro}
        >
          <span style={styles.addIcon}>+</span>
          Adicionar consulta
        </button>
      </div>

      {/* LISTA DE CONSULTAS */}
      <div className="home-idoso-consultas">
        {loading && <p>Carregando consultas...</p>}

        {error && (
          <p>Não foi possível carregar as consultas.</p>
        )}

        {!loading && !error && consultas.length === 0 && (
          <div className="consulta-idoso-vazio">
            <img
              src={logoImg}
              alt="Dia a Dia Vovôs"
              className="consulta-idoso-vazio-logo"
            />

            <p className="consulta-idoso-vazio-texto">
              Nenhuma consulta marcada
            </p>
          </div>
        )}

        {!loading && !error && consultas.length > 0 && (
          <ConsultasList
            consultas={consultas}
            formatarData={formatarData}
            onDelete={handleDelete}
            onEdit={handleAbrirEdicao}
          />
        )}
      </div>

      {/* MODAL DE SUCESSO */}
      {sucesso && (
        <div style={styles.innerModalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>
              Sucesso!
            </h2>

            <p style={styles.modalText}>
              A consulta foi excluída com sucesso.
            </p>

            <button
              onClick={() => setSucesso(false)}
              style={styles.modalButton}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      <CadastrarConsulta
        isOpen={isModalOpen}
        onClose={handleFecharModal}
        consultaEditando={consultaEditando}
      />

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {idParaDeletar != null && (
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