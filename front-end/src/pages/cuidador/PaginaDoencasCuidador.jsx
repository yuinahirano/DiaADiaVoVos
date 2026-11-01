import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDoencas } from "../../hooks/useDoencas";
import logoImg from "../../assets/logo_DiaADia.png";
import { useIdosoSelecionado } from "../../hooks/useIdosoSelecionado";
import CadastrarDoenca from "./PaginaAddDoenca";
import DoencasList from "../../components/doencas/DoencaList";

import "../../components/styles/HomeIdoso.css";
import "../../components/styles/Doencas.css";
import "../../components/styles/Consultas.css";

export default function PaginaDoencas() {
  const navigate = useNavigate();
  const { idoso, loading: loadingIdoso } = useIdosoSelecionado();

  const {
    doencas,
    loading: loadingDoencas,
    error,
    deleteDoenca,
    refetch,
  } = useDoencas(idoso?.id, !loadingIdoso);

  const loading = loadingIdoso || loadingDoencas;

  const nomeIdoso = loadingIdoso ? "Carregando..." : idoso?.nome || "Idoso";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doencaEditando, setDoencaEditando] = useState(null);
  const [idParaDeletar, setIdParaDeletar] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const handleAbrirConfirmacao = (id) => {
    setIdParaDeletar(id);
  };

  const handleConfirmarDeletar = async () => {
    if (!idParaDeletar || excluindo) return;

    setExcluindo(true);

    try {
      await deleteDoenca(idParaDeletar);
      setIdParaDeletar(null);
    } catch (erro) {
      console.error("Erro ao excluir doença:", erro);
    } finally {
      setExcluindo(false);
    }
  };

  const handleAbrirCadastro = () => {
    setDoencaEditando(null);
    setIsModalOpen(true);
  };

  const handleEdit = (condicao) => {
    setDoencaEditando(condicao);
    setIsModalOpen(true);
  };

  const handleFecharModal = () => {
    setIsModalOpen(false);
    setDoencaEditando(null);
    refetch?.();
  };

  return (
    <div className="home-idoso-container">
      <header className="home-idoso-header">
        <button
          className="home-idoso-icone-btn"
          aria-label="Voltar"
          onClick={() => navigate("/notificacoes-cuidador")}
          style={styles.backButton}
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        <h1 className="home-idoso-titulo">{nomeIdoso}</h1>

        <button className="home-idoso-btn-ativo">Doenças</button>

        <button
          className="home-idoso-link"
          onClick={() => navigate("/consultas")}
        >
          Consultas
        </button>

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

        <button
          className="home-idoso-icone-btn"
          aria-label="Sair"
          onClick={() => navigate("/sair")}
        >
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </header>

      <div style={styles.actionRow}>
        <button style={styles.addButton} onClick={handleAbrirCadastro}>
          <span style={styles.addIcon}>+</span>
          Adicionar doença
        </button>
      </div>

      <main className="home-idoso-consultas">
        {loading && <p style={styles.loadingText}>Carregando doenças...</p>}

        {!loading && error && <p>Não foi possível carregar as doenças.</p>}

        {!loading && !error && (!doencas || doencas.length === 0) && (
          <div className="home-idoso-vazio">
            <img
              src={logoImg}
              alt="Dia a Dia Vovôs"
              className="home-idoso-vazio-logo"
            />
            <p className="home-idoso-vazio-texto">Nenhuma doença cadastrada</p>
          </div>
        )}

        {!loading && !error && doencas && doencas.length > 0 && (
          <DoencasList
            doencas={doencas}
            onDelete={handleAbrirConfirmacao}
            onEdit={handleEdit}
          />
        )}
      </main>

      <CadastrarDoenca
        isOpen={isModalOpen}
        onClose={handleFecharModal}
        doencaEditando={doencaEditando}
      />

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
  loadingText: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
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