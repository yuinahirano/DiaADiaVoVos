
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import MedicamentosList from "../../components/medicamentos/MedicamentosList";
import { useMedicamentos } from "../../hooks/useMedicamentos";
import { useIdosoSelecionado } from "../../hooks/useIdosoSelecionado";
import { AuthContext } from "../../contexts/AuthContext";
import logoImg from "../../assets/logo_DiaADia.png";

import "../../components/styles/HomeIdoso.css";
import "../../components/styles/Doencas.css";
import "../../components/styles/Consultas.css";

export default function PaginaMedicamentos() {
  const navigate = useNavigate();

  const { medicamentos, loading, deletarMedicamento, error } =
    useMedicamentos();

  const { idoso, loading: loadingIdoso } = useIdosoSelecionado();

  const auth = useContext(AuthContext);
  const logout = auth?.logout;

  const [idParaDeletar, setIdParaDeletar] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");

  const nomeIdoso = loadingIdoso
    ? "Carregando..."
    : idoso?.nome || "Idoso";

  const handleAbrirConfirmacao = (id) => {
    setErroExclusao("");
    setIdParaDeletar(id);
  };

  const handleConfirmarDeletar = async () => {
    if (idParaDeletar == null || excluindo) return;

    try {
      setExcluindo(true);
      setErroExclusao("");

      await deletarMedicamento(idParaDeletar);

      setIdParaDeletar(null);
    } catch (erro) {
      console.error("Erro ao excluir medicamento:", erro);
      setErroExclusao("Não foi possível excluir o medicamento. Tente novamente.");
    } finally {
      setExcluindo(false);
    }
  };

  const handleAbrirCadastro = () => {
    navigate("/medicamentos/novo");
  };

  const handleAbrirEdicao = (medicamento) => {
    navigate("/medicamentos/editar", {
      state: { medicamento },
    });
  };

  const handleSair = async () => {
    if (typeof logout === "function") {
      await logout();
      navigate("/login", { replace: true });
      return;
    }

    // Se o contexto não disponibilizar logout, não simula uma saída.
    navigate("/login", { replace: true });
  };

  return (
    <div className="home-idoso-container">
      <header className="home-idoso-header">
        <button
          type="button"
          className="home-idoso-icone-btn"
          aria-label="Voltar"
          onClick={() => navigate("/home-cuidador")}
          style={styles.backButton}
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        <h1 className="home-idoso-titulo">{nomeIdoso}</h1>

        <button
          type="button"
          className="home-idoso-link"
          onClick={() => navigate("/doencas")}
        >
          Doenças
        </button>

        <button
          type="button"
          className="home-idoso-link"
          onClick={() => navigate("/consultas")}
        >
          Consultas
        </button>

        <button
          type="button"
          className="home-idoso-btn-ativo"
          aria-current="page"
        >
          Medicamentos
        </button>

        <button
          type="button"
          className="home-idoso-link"
          onClick={() => navigate("/registro-saude")}
        >
          Registro Saúde
        </button>

        <button
          type="button"
          className="home-idoso-icone-btn"
          aria-label="Notificações"
          onClick={() => navigate("/notificacoes")}
          style={styles.notifyButton}
        >
          <i className="bi bi-bell"></i>
        </button>

        <button
          type="button"
          className="home-idoso-icone-btn"
          aria-label="Sair"
          onClick={handleSair}
        >
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </header>

      <div style={styles.actionRow}>
        <button
          type="button"
          style={styles.addButton}
          onClick={handleAbrirCadastro}
        >
          <span style={styles.addIcon}>+</span>
          Adicionar medicamento
        </button>
      </div>

      <main className="home-idoso-doencas">
        {loading ? (
          <p style={styles.loadingText}>Carregando medicamentos...</p>
        ) : (
          <MedicamentosList
            medicamentos={medicamentos || []}
            onDelete={handleAbrirConfirmacao}
            onEdit={handleAbrirEdicao}
          />
        )}
      </main>

      {error && (
        <p role="alert" style={styles.errorText}>
          Não foi possível carregar os medicamentos.
        </p>
      )}

      {!loading && !error && (medicamentos || []).length === 0 && (
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

      {idParaDeletar != null && (
        <div style={styles.modalOverlay}>
          <div
            style={styles.modalBox}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-confirmacao"
          >
            <h3 id="titulo-confirmacao">
              Tem certeza que deseja excluir?
            </h3>

            <p>Esta ação não poderá ser desfeita.</p>

            {erroExclusao && (
              <p role="alert" style={styles.errorText}>
                {erroExclusao}
              </p>
            )}

            <div style={styles.modalButtons}>
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={() => {
                  if (!excluindo) {
                    setIdParaDeletar(null);
                    setErroExclusao("");
                  }
                }}
                disabled={excluindo}
              >
                Cancelar
              </button>

              <button
                type="button"
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

  errorText: {
    color: "#b42318",
    fontWeight: "bold",
    marginTop: "12px",
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
    gap: "12px",
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
