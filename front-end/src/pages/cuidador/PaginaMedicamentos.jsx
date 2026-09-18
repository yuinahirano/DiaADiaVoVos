import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import MedicamentosList from "../../components/medicamentos/MedicamentosList";
import { useMedicamentos } from "../../hooks/useMedicamentos";
import { useIdosoSelecionado } from "../../hooks/useIdosoSelecionado";
import { AuthContext } from "../../contexts/AuthContext";
import CadastrarMedicamento from "./PaginaAddMedicamento";
import logoImg from "../../assets/logo_DiaADia.png";

// Estilos padronizados
import "../../components/styles/HomeIdoso.css";
import "../../components/styles/Consultas.css";

export default function MedicationPage() {
  const navigate = useNavigate();
  const { user, isCuidador } = useContext(AuthContext);
  const { medicamentos, loading, deletarMedicamento } = useMedicamentos();
  const { idoso, loading: loadingIdoso } = useIdosoSelecionado();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicamentoEditando, setMedicamentoEditando] = useState(null);
  const [idParaDeletar, setIdParaDeletar] = useState(null);

  useEffect(() => {
    if (idoso) {
      localStorage.setItem("@DiaADia:idosoSelecionado", JSON.stringify(idoso));
    }
  }, [idoso]);

  const primeiroNomeUsuario = user?.nome ? user.nome.split(" ")[0] : "";
  const tituloHeader = isCuidador
    ? loadingIdoso
      ? "Carregando..."
      : idoso?.nome || "Idoso"
    : `Olá ${primeiroNomeUsuario}`;

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
      {/* NAVEGAÇÃO IDÊNTICA ÀS OUTRAS TELAS */}
      <header className="home-idoso-header">
        <h1 className="home-idoso-titulo">{tituloHeader}</h1>

        <button
          className="home-idoso-icone-btn"
          aria-label="Voltar"
          onClick={() => navigate(isCuidador ? "/home-cuidador" : "/home-idoso")}
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        <button
          className="home-idoso-link"
          onClick={() => navigate("/doencas")}
        >
          Doenças
        </button>

        <button
          className="home-idoso-link"
          onClick={() => navigate("/consultas")}
        >
          Consultas
        </button>

        <button className="home-idoso-btn-ativo">Medicamentos</button>

        <button
          className="home-idoso-link"
          onClick={() => navigate("/registro-saude")}
        >
          Registro Saúde
        </button>

        {!isCuidador && (
          <button
            className="home-idoso-icone-btn"
            aria-label="Notificações"
            onClick={() => navigate("/notificacoes-idoso")}
          >
            <i className="bi bi-bell"></i>
          </button>
        )}
      </header>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="home-idoso-doencas">
        {isCuidador && (
          <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", marginBottom: "15px" }}>
            <button
              style={{
                backgroundColor: "#FFE866",
                color: "#000",
                border: "none",
                borderRadius: "20px",
                padding: "8px 20px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
              onClick={() => {
                setMedicamentoEditando(null);
                setIsModalOpen(true);
              }}
            >
              + Adicionar medicamento
            </button>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: "center", fontWeight: "bold" }}>Carregando medicamentos...</p>
        ) : !medicamentos || medicamentos.length === 0 ? (
          <div className="home-idoso-vazio">
            <img
              src={logoImg}
              alt="Dia a Dia Vovôs"
              className="home-idoso-vazio-logo"
            />
            <p className="home-idoso-vazio-texto">Nenhum medicamento cadastrado</p>
          </div>
        ) : (
          <MedicamentosList
            medicamentos={medicamentos}
            onDelete={handleAbrirConfirmacao}
            onEdit={handleAbrirEdicao}
          />
        )}
      </div>

      {/* MODAIS */}
      <CadastrarMedicamento
        isOpen={isModalOpen}
        onClose={handleFecharModal}
        medicamentoEditando={medicamentoEditando}
      />

      {idParaDeletar && (
        <div style={modalStyles.modalOverlay}>
          <div style={modalStyles.modalBox}>
            <h3>Tem certeza que deseja excluir?</h3>
            <p>Esta ação não poderá ser desfeita.</p>
            <div style={modalStyles.modalButtons}>
              <button
                style={modalStyles.cancelBtn}
                onClick={() => setIdParaDeletar(null)}
              >
                Cancelar
              </button>
              <button
                style={modalStyles.confirmBtn}
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

const modalStyles = {
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