import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useDoencas } from "../../hooks/useDoencas";
import logoImg from "../../assets/logo_DiaADia.png";
import DoencasList from "../../components/doencas/DoencaList";
import { useIdosoSelecionado } from "../../hooks/useIdosoSelecionado";
import CadastrarDoenca from "./PaginaAddDoenca";

import "../../components/styles/HomeIdoso.css";
import "../../components/styles/Doencas.css";
import "../../components/styles/Consultas.css";

export default function PaginaDoencas() {
  const { idoso, loading: loadingIdoso } = useIdosoSelecionado();
  const { doencas, loading, error, deleteDoenca, refetch } = useDoencas(idoso?.id);
  const navigate = useNavigate();
  const nomeIdoso = loadingIdoso ? "Carregando..." : idoso?.nome || "Idoso";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doencaEditando, setDoencaEditando] = useState(null);

  const handleDelete = (id) => {
    if (deleteDoenca) {
      deleteDoenca(id);
    } else {
      console.log("Deletar doença:", id);
    }
  };

  const handleAbrirCadastro = () => {
    setDoencaEditando(null);
    setIsModalOpen(true);
  };

  const handleEdit = (doenca) => {
    setDoencaEditando(doenca);
    setIsModalOpen(true);
  };

  const handleFecharModal = () => {
    setIsModalOpen(false);
    setDoencaEditando(null);
    refetch();
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

        {/* barra de navegação e seus botões */}
        <button className="home-idoso-btn-ativo">Doenças</button>

        {/* botão de consultas*/}
        <button
          className="home-idoso-link"
          onClick={() => navigate("/consultas")}
        >
          Consultas
        </button>

        {/* botão de medicamento*/}
        <button
          className="home-idoso-link"
          onClick={() => navigate("/medicamentos")}
        >
          Medicamentos
        </button>

        {/* botão de registro de saude */}
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

      {/* botão de adicionar doença */}
      <div style={styles.actionRow}>
        <button style={styles.addButton} onClick={handleAbrirCadastro}>
          <span style={styles.addIcon}>+</span>
          Adicionar doença
        </button>
      </div>

      {/* corpo */}
      <div className="home-idoso-doencas">
        {loading && <p>Carregando doenças...</p>}

        {error && <p>Não foi possível carregar as doenças.</p>}

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
          <DoencasList
            doencas={doencas}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
      </div>

      {/* modal de cadastro/edição */}
      <CadastrarDoenca
        isOpen={isModalOpen}
        onClose={handleFecharModal}
        doencaEditando={doencaEditando}
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