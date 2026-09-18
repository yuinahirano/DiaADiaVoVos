import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useDoencas } from "../../hooks/useDoencas";
import logoImg from "../../assets/logo_DiaADia.png";
import DoencasList from "../../components/doencas/DoencaList";
import { useIdosoSelecionado } from "../../hooks/useIdosoSelecionado";

import "../../components/styles/HomeIdoso.css";
import "../../components/styles/Doencas.css";
import "../../components/styles/Consultas.css";

export default function PaginaDoencas() {
  //const { user } = useContext(AuthContext);
  const { idoso, loading: loadingIdoso } = useIdosoSelecionado();
  const { doencas, loading, error, deleteDoenca } = useDoencas(idoso?.id);
  const navigate = useNavigate();
  //const primeiroNome = user?.nome ? user.nome.split(" ")[0] : "";
  const nomeIdoso = loadingIdoso ? "Carregando..." : idoso?.nome || "Idoso";

  const handleDelete = (id) => {
    if (deleteDoenca) {
      deleteDoenca(id);
    } else {
      console.log("Deletar doença:", id);
    }
  };

  const handleEdit = (doenca) => {
    console.log("Editar doença:", doenca);
    // Exemplo: navigate(`/editar-doenca/${doenca.id}`);
  };

  return (
    <div className="home-idoso-container">
      <header className="home-idoso-header">

        {/* botão de voltar */}
        <button
          className="home-idoso-icone-btn"
          aria-label="Voltar"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        {/* saudacao */}
        <h1 className="home-idoso-titulo">{nomeIdoso}</h1>


        {/* barra de navegação e seus botoões */}
        <button className="home-idoso-btn-ativo">Doenças</button>

        <button
          className="home-idoso-link"
          onClick={() => navigate("/consultas")}
        >
          Consultas
        </button>

        <button
          className="home-idoso-link"
          onClick={() => navigate("/medicamentos-idoso")}
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
        >
          <i className="bi bi-bell"></i>
        </button>
      </header>

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

        {/* chamando os componentes com a listagem */}
        {!loading && !error && doencas.length > 0 && (
          <DoencasList
            doencas={doencas}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}

      </div>
    </div>
  );
}