import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MedicamentosList from "../../components/medicamentos/MedicamentosList";
import { useMedicamentos } from "../../hooks/useMedicamentos";
import { useIdosoSelecionado } from "../../hooks/useIdosoSelecionado";
import CadastrarMedicamento from "./PaginaAddMedicamento";
import PaginaHomeCuidador from "../../pages/cuidador/PaginaHomeCuidador";
import logoImg from "../../assets/logo_DiaADia.png";

import "../../components/styles/HomeIdoso.css";
import "../../components/styles/Doencas.css";
import "../../components/styles/Consultas.css";

export default function MedicationPage() {
  const navigate = useNavigate();
  const { medicamentos, loading, deletarMedicamento, error } =
    useMedicamentos();
  const { idoso, loading: loadingIdoso } = useIdosoSelecionado();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicamentoEditando, setMedicamentoEditando] = useState(null);
  const [idParaDeletar, setIdParaDeletar] = useState(null);

  const nomeIdoso = loadingIdoso ? "Carregando..." : idoso?.nome || "Idoso";

  const handleAbrirConfirmacao = (id) => {
    setIdParaDeletar(id);
  };

  const handleConfirmarDeletar = async () => {
    if (idParaDeletar) {
      await deletarMedicamento(idParaDeletar);
      setIdParaDeletar(null);
    }
  };

  const handleAbrirEdicao = (medicamento) => {
    setMedicamentoEditando(medicamento);
    setIsModalOpen(true);
  };

  const handleFecharModal = () => {
    setIsModalOpen(false);
    setMedicamentoEditando(null);
  };

  return (
    <div className="home-idoso-container">
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

        {/* botão de consultas */}
        <button
          className="home-idoso-link"
          onClick={() => navigate("/consultas")}
        >
          Consultas
        </button>

        {/* botão de medicamentos */}
        <button className="home-idoso-btn-ativo">Medicamentos</button>

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

      {/* adicionar medicamento */}
      <div style={styles.actionRow}>
        <button
          style={styles.addButton}
          onClick={() => {
            setMedicamentoEditando(null);
            setIsModalOpen(true);
          }}
        >
          <span style={styles.addIcon}>+</span>
          Adicionar medicamento
        </button>
      </div>

      {/* lista de medicamentos da página */}
      <main className="home-idoso-consultas">
        {loading ? (
          <p style={styles.loadingText}>Carregando medicamentos...</p>
        ) : !medicamentos || medicamentos.length === 0 ? (
          <div className="home-idoso-vazio">
            <img
              src={logoImg}
              alt="Dia a Dia Vovôs"
              className="home-idoso-vazio-logo"
            />
            <p className="home-idoso-vazio-texto">
              Nenhum medicamento registrado
            </p>
          </div>
        ) : (
          <MedicamentosList
            medicamentos={medicamentos}
            onDelete={handleAbrirConfirmacao}
            onEdit={handleAbrirEdicao}
          />
        )}
      </main>

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

      {/* modal para cadastro */}
      <CadastrarMedicamento
        isOpen={isModalOpen}
        onClose={handleFecharModal}
        medicamentoEditando={medicamentoEditando}
      />

      {/* deletar medicamento */}
      {idParaDeletar && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3>Tem certeza que deseja excluir?</h3>
            <p>Esta ação não poderá ser desfeita.</p>
            <div style={styles.modalButtons}>
              <button
                style={styles.cancelBtn}
                onClick={() => setIdParaDeletar(null)}
              >
                Cancelar
              </button>
              <button
                style={styles.confirmBtn}
                onClick={handleConfirmarDeletar}
              >
                Sim, excluir
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
