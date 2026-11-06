import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useContext } from "react";
import CardsConfig from "../../components/configuracao/cuidador/Card";

//estilizações
import "../../components/styles/HomeIdoso.css";

export default function PaginaConfiguracao() {

    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const primeiroNome = user?.nome ? user.nome.toUpperCase().split(" ")[0] : "cuidador";
    
    return (
        <div className="home-idoso-container">
                  {/* barra de navegação */}
            <header className="home-idoso-header w-100">

                {/* botão de voltar */}
                <button
                  className="home-idoso-icone-btn"
                  aria-label="Voltar"
                  onClick={() => navigate("/home-cuidador")}>
                  <i className="bi bi-chevron-left"></i>
                </button>

              {/* saudação */}
              <h1 className="home-idoso-titulo">Olá, {primeiroNome}</h1>

              {/* botão de vinculação */}
              <div className="d-flex align-items-center gap-3">

                {/* botão de sair */}
              <button
                className="home-idoso-icone-btn"
                aria-label="Sair"
                onClick={() => navigate("/sair")}
              >
                <i className="bi bi-box-arrow-right"></i>
              </button>
              </div>
            </header>

            <main>
              <CardsConfig/>
            </main>
            
        </div>
    );
}