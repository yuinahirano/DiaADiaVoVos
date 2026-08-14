import { useUsers } from "../hooks/useUsers";
import logoImg from "../assets/logo.png";

export default function PaginaLogin() {
    const { 
        email, 
        setEmail, 
        senha, 
        setSenha, 
        setEfetuarLogin 
    } = useUsers();

    return (
        <div className="d-flex align-items-center justify-content-center">
            <div className="login-card">
                {/* O submit dispara a mudança do estado de gatilho diretamente */}
                <form 
                    className="form-container" 
                    id="form-login" 
                    onSubmit={(e) => {
                        e.preventDefault();
                        setEfetuarLogin(true);
                    }}
                >
                    
                    <div className="logo-container">
                        <img src={logoImg} alt="Logo Dia a Dia Vovôs" className="logo-arredondado" />
                    </div>

                    <div className="input-wrapper mb-3">
                        <i className="bi bi-person-fill input-icon" />
                        <input 
                            type="email"
                            id="TxtEmail"
                            placeholder="Email"
                            className="form-input-custom"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="input-wrapper mb-4">
                        <i className="bi bi-lock-fill input-icon"></i>
                        <input 
                            type="password"
                            id="TxtSenha"
                            className="form-input-custom"
                            placeholder="Senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="button-wrapper">
                        <button type="submit" className="btn-painel-roxo w-100">
                            Entrar no Painel
                        </button>
                    </div>

                    <div className="text-center mt-4 link-wrapper">
                        <a href="#" className="link-rodape">Criar um novo usuário</a>
                    </div>

                </form>
            </div>
        </div>
    );
}