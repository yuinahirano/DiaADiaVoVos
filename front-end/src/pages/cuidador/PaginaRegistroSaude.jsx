import { useNavigate } from "react-router-dom";  
import { useIdosoSelecionado } from "../../hooks/useIdosoSelecionado";  
import { useRegistroSaude } from "../../hooks/useRegistroSaude";  
import logoImg from "../../assets/logo_DiaADia.png"; 
import PaginaHomeCuidador from '../../pages/cuidador/PaginaHomeCuidador'; 

//estilizações
import "../../components/styles/HomeIdoso.css";
import "../../components/styles/Doencas.css";
import "../../components/styles/Consultas.css";

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
  
function formatarPeso(peso) {  
  if (peso === null || peso === undefined || peso === "") return "--";  
  const numero = Number(peso);  
  if (isNaN(numero)) return "--";  
  return `${numero.toFixed(2).replace(".", ",")}kg`;  
}  
  
function formatarFrequencia(valor) {  
  if (valor === null || valor === undefined || valor === "") return "--";  
  return `${Number(valor)} bpm`;  
}  
  
function formatarSaturacao(valor) {  
  if (valor === null || valor === undefined || valor === "") return "--";  
  return `${Number(valor)}%`;  
}  
  
export default function PaginaRegistroSaude() {  
  const navigate = useNavigate();  
  const { idoso, loading: loadingIdoso } = useIdosoSelecionado();  
  const { registro, loading: loadingRegistro, erro } = useRegistroSaude();  
  
  const nomeIdoso = loadingIdoso ? "Carregando..." : (idoso?.nome || "Idoso");  
  const loading = loadingIdoso || loadingRegistro;  
  
  return (  
    <div  className="home-idoso-container">  

    {/* barra de navegação */}
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

        <button className="home-idoso-btn-ativo">Registro Saúde</button>

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
  
      <main className="home-idoso-doencas">  
        {loading && (  
          <p style={styles.loadingText}>Carregando registro de saúde...</p>  
        )}  
  
        {!loading && erro && (  
          <p style={styles.loadingText}>{erro}</p>  
        )}  
  
        {!loading && !erro && !registro && (  
          <div style={styles.vazioCard}>  
            <img  
              src={logoImg}  
              alt="Dia a Dia Vovôs"  
              style={styles.vazioLogo}  
            />  
            <p style={styles.vazioTexto}>  
              Nenhum registro de<br />saúde cadastrado  
            </p>  
          </div>  
        )}  
  
        {!loading && !erro && registro && (  
          <div style={styles.grid}>  
            <div style={styles.card}>  
              <h2 style={styles.cardTitulo}>Frequência Cardíaca</h2>  
              <p style={styles.cardValor}>  
                {formatarFrequencia(registro.frequenciaCardiaca)}  
              </p>  
            </div>  
  
            <div style={styles.card}>  
              <h2 style={styles.cardTitulo}>Saturação do Sangue</h2>  
              <p style={styles.cardValor}>  
                {formatarSaturacao(registro.saturacaoSangue)}  
              </p>  
            </div>  
  
            <div style={styles.card}>  
              <h2 style={styles.cardTitulo}>Peso</h2>  
              <p style={styles.cardValor}>{formatarPeso(registro.peso)}</p>  
            </div>  
  
            <div style={styles.card}>  
              <h2 style={styles.cardTitulo}>Data de Cadastro</h2>  
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
  container: {  
    backgroundColor: '#EBF3FF',  
    minHeight: '100vh',  
    padding: '40px 60px',  
    fontFamily: 'Arial, sans-serif',  
    display: 'flex',  
    flexDirection: 'column'  
  },  
  header: {  
    backgroundColor: '#FFFFFF',  
    borderRadius: '50px',  
    padding: '10px 30px',  
    display: 'flex',  
    justifyContent: 'space-between',  
    alignItems: 'center',  
    marginBottom: '40px'  
  },  
  titleSection: {  
    display: 'flex',  
    alignItems: 'center',  
    gap: '15px'  
  },  
  backButton: {
    backgroundColor: "#FFE866",
    color: "#000000",
  },
  notifyButton: {
    backgroundColor: "#FFE866",
    color: "#000000",
  },
  title: {  
    fontSize: '32px',  
    fontWeight: 'bold',  
    margin: 0  
  },  
  nav: {  
    display: 'flex',  
    gap: '20px',  
    alignItems: 'center'  
  },  
  activeTab: {  
    backgroundColor: '#FFE866',  
    border: 'none',  
    borderRadius: '25px',  
    padding: '8px 25px',  
    fontSize: '16px',  
    fontWeight: 'bold',  
    cursor: 'pointer',  
    outline: 'none'  
  },  
  inactiveNav: {  
    backgroundColor: 'transparent',  
    border: 'none',  
    fontSize: '16px',  
    fontWeight: 'bold',  
    cursor: 'pointer',  
    color: '#000000',  
    outline: 'none'  
  },  
  mainContent: {  
    display: 'flex',  
    justifyContent: 'center',  
    alignItems: 'center',  
    flex: 1  
  },  
  grid: {  
    display: 'grid',  
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',  
    gap: '30px',  
    width: '100%'  
  },  
  card: {  
    backgroundColor: '#FFFFFF',  
    borderRadius: '24px',  
    padding: '30px',  
    textAlign: 'center',  
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'  
  },  
  cardTitulo: {  
    fontSize: '20px',  
    fontWeight: 'bold',  
    color: '#000000',  
    margin: '0 0 12px 0'  
  },  
  cardValor: {  
    fontSize: '22px',  
    fontWeight: 'bold',  
    color: '#000000',  
    margin: 0  
  },  
  loadingText: {  
    fontSize: '18px',  
    fontWeight: 'bold',  
    color: '#333',  
    textAlign: 'center'  
  },  
  vazioCard: {  
    backgroundColor: '#FFFFFF',  
    borderRadius: '24px',  
    width: '420px',  
    height: '280px',  
    display: 'flex',  
    flexDirection: 'column',  
    alignItems: 'center',  
    justifyContent: 'center',  
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',  
    margin: '0 auto',  
    boxSizing: 'border-box',  
    padding: '20px'  
  },  
  vazioLogo: {  
    width: '110px',  
    height: 'auto',  
    marginBottom: '20px'  
  },  
  vazioTexto: {  
    fontSize: '20px',  
    fontWeight: 'bold',  
    color: '#000000',  
    margin: 0,  
    textAlign: 'center',  
    lineHeight: '1.3'  
  }  
};