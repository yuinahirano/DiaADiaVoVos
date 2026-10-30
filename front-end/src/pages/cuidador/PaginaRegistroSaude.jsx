import { useNavigate } from "react-router-dom";
import { useIdosoSelecionado } from "../../hooks/useIdosoSelecionado";
import { useRegistroSaude } from "../../hooks/useRegistroSaude";
import logoImg from "../../assets/logo_DiaADia.png";

// Estilizações
import "../../components/styles/HomeIdoso.css";
import "../../components/styles/Doencas.css";
import "../../components/styles/Consultas.css";

// Formata a data
function formatarData(dataIso) {
  if (!dataIso) return "dd/MM/AAAA";

  const data = new Date(dataIso);

  if (isNaN(data.getTime())) return "dd/MM/AAAA";

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Formata o peso
function formatarPeso(peso) {
  if (peso === null || peso === undefined || peso === "") {
    return "--";
  }

  const numero = Number(peso);

  if (isNaN(numero)) return "--";

  return `${numero.toFixed(2).replace(".", ",")} kg`;
}

// Formata a frequência cardíaca
function formatarFrequencia(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return "--";
  }

  return `${Number(valor)} bpm`;
}

// Formata a saturação do sangue
function formatarSaturacao(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return "--";
  }

  return `${Number(valor)}%`;
}

export default function PaginaRegistroSaude() {
  const navigate = useNavigate();

  const { idoso, loading: loadingIdoso } = useIdosoSelecionado();

  const {
    registro,
    loading: loadingRegistro,
    erro,
  } = useRegistroSaude();

  const nomeIdoso = loadingIdoso
    ? "Carregando..."
    : idoso?.nome || "Idoso";

  const loading = loadingIdoso || loadingRegistro;

  return (
    <div className="home-idoso-container">
      {/* BARRA DE NAVEGAÇÃO */}
      <header className="home-idoso-header">
        {/* Botão de voltar */}
        <button
          className="home-idoso-icone-btn"
          aria-label="Voltar"
          onClick={() => navigate("/home-cuidador")}
          style={styles.backButton}
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        {/* Nome do idoso */}
        <h1 className="home-idoso-titulo">
          {nomeIdoso}
        </h1>

        {/* Botão de doenças */}
        <button
          className="home-idoso-link"
          onClick={() => navigate("/doencas")}
        >
          Doenças
        </button>

        {/* Botão de consultas */}
        <button
          className="home-idoso-link"
          onClick={() => navigate("/consultas")}
        >
          Consultas
        </button>

        {/* Botão de medicamentos */}
        <button
          className="home-idoso-link"
          onClick={() => navigate("/medicamentos")}
        >
          Medicamentos
        </button>

        {/* Botão de registro de saúde */}
        <button className="home-idoso-btn-ativo">
          Registro Saúde
        </button>

        {/* Botão de notificações */}
        <button
          className="home-idoso-icone-btn"
          aria-label="Notificações"
          onClick={() => navigate("/notificacoes-idoso")}
          style={styles.notifyButton}
        >
          <i className="bi bi-bell"></i>
        </button>

        {/* Botão de sair */}
        <button
          className="home-idoso-icone-btn"
          aria-label="Sair"
          onClick={() => navigate("/sair")}
        >
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </header>

      {/* CONTEÚDO DA PÁGINA */}
      <main style={styles.mainVazio}>
        {/* Carregamento */}
        {loading && (
          <p style={styles.loadingText}>
            Carregando registro de saúde...
          </p>
        )}

        {/* Mensagem de erro */}
        {!loading && erro && (
          <p style={styles.loadingText}>
            {erro}
          </p>
        )}

        {/* CARD QUANDO NÃO EXISTE REGISTRO */}
        {!loading && !erro && !registro && (
          <div style={styles.vazioCard}>
            <img
              src={logoImg}
              alt="Dia a Dia Vovôs"
              style={styles.vazioLogo}
            />

            <p style={styles.vazioTexto}>
              Nenhum registro de
              <br />
              saúde cadastrado
            </p>
          </div>
        )}

        {/* CARDS COM OS DADOS DE SAÚDE */}
        {!loading && !erro && registro && (
          <div style={styles.grid}>
            <div style={styles.card}>
              <h2 style={styles.cardTitulo}>
                Frequência Cardíaca
              </h2>

              <p style={styles.cardValor}>
                {formatarFrequencia(registro.frequenciaCardiaca)}
              </p>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitulo}>
                Saturação do Sangue
              </h2>

              <p style={styles.cardValor}>
                {formatarSaturacao(registro.saturacaoSangue)}
              </p>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitulo}>
                Peso
              </h2>

              <p style={styles.cardValor}>
                {formatarPeso(registro.peso)}
              </p>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitulo}>
                Data de Cadastro
              </h2>

              <p style={styles.cardValor}>
                {formatarData(registro.dataRegistro)}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  // Botão de voltar
  backButton: {
    backgroundColor: "#FFE866",
    color: "#000000",
  },

  // Botão de notificações
  notifyButton: {
    backgroundColor: "#FFE866",
    color: "#000000",
  },

  // Área principal: centraliza o conteúdo
  mainVazio: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 153px)",
    width: "100%",
    boxSizing: "border-box",
    padding: "20px",
  },

  // Grade dos registros de saúde
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "30px",
    width: "100%",
  },

  // Cards com os dados de saúde
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "24px",
    padding: "30px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  },

  // Títulos dos cards
  cardTitulo: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#000000",
    margin: "0 0 12px 0",
  },

  // Valores dos registros
  cardValor: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#000000",
    margin: 0,
  },

  // Texto de carregamento e erro
  loadingText: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
  },

  // Card exibido quando não há registro
  vazioCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "36px",
    width: "420px",
    minHeight: "280px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    boxSizing: "border-box",
    padding: "30px",
    textAlign: "center",
    maxWidth: "100%",
  },

  // Logo do card vazio
  vazioLogo: {
    width: "110px",
    height: "auto",
    marginBottom: "20px",
  },

  // Mensagem do card vazio
  vazioTexto: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#000000",
    margin: 0,
    textAlign: "center",
    lineHeight: "1.3",
  },
};