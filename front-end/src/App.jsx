<<<<<<< HEAD
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PaginaLogin from "./pages/PaginaLogin";
import PaginaCadastro from "./pages/PaginaCadastro";
import PaginaTipoUsuario from "./pages/PaginaTipoUsuario";
import PaginaDadosCuidador from "./pages/PaginaDadosCuidador";
import PaginaDadosIdoso from "./pages/PaginaDadosIdoso";
import PaginaVincularCuidador from "./pages/PaginaVincularCuidador";
import PaginaMedicamentos from "./pages/PaginaMedicamentos";
import PaginaHomeIdoso from "./pages/PaginaHomeIdoso";
import PaginaHomeCuidador from "./pages/PaginaHomeCuidador";
import PaginaConsultas from "./pages/PaginaConsultas";
import PaginaMedicamentosIdoso from "./pages/PaginaMedicamentosIdoso";
import PaginaNotificacoesIdoso from "./pages/PaginaNotificacoesIdoso";
import PaginaDoencas from "./pages/PaginaDoencas";
import PaginaSair from "./pages/PaginaSair";
=======
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas públicas
import PaginaLogin from './pages/PaginaLogin';
import PaginaCadastro from './pages/PaginaCadastro';
import PaginaTipoUsuario from './pages/PaginaTipoUsuario';

// Páginas do cuidador
import PaginaDadosCuidador from './pages/cuidador/PaginaDadosCuidador';
import PaginaHomeCuidador from './pages/cuidador/PaginaHomeCuidador';
import PaginaVincularCuidador from './pages/cuidador/PaginaVincularCuidador';
import PaginaMedicamentos from './pages/cuidador/PaginaMedicamentos';
import PaginaRegistroSaude from './pages/cuidador/PaginaRegistroSaude';
import PaginaConsultas from './pages/cuidador/PaginaConsultas';
import PaginaDoencas from './pages/cuidador/PaginaDoencas';

// Páginas do idoso
import PaginaDadosIdoso from './pages/idoso/PaginaDadosIdoso';
import PaginaHomeIdoso from './pages/idoso/PaginaHomeIdoso';
import PaginaMedicamentosIdoso from './pages/idoso/PaginaMedicamentosIdoso';
import PaginaNotificacoesIdoso from './pages/idoso/PaginaNotificacoesIdoso';
>>>>>>> 178e9df631ad414fb7b4fa1952afb2efda87e39f

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
<<<<<<< HEAD
          <Route path="/" element={<PaginaLogin />} />
          <Route path="/cadastro" element={<PaginaCadastro />} />
          <Route path="/tipo-usuario" element={<PaginaTipoUsuario />} />
          <Route path="/dados-cuidador" element={<PaginaDadosCuidador />} />
          <Route path="/dados-idoso" element={<PaginaDadosIdoso />} />
          <Route
            path="/vincular-cuidador"
            element={<PaginaVincularCuidador />}
          />

          {/* Rotas protegidas exclusivas do IDOSO */}
          <Route element={<ProtectedRoute allowedRoles={["idoso"]} />}>
            <Route path="/home-idoso" element={<PaginaHomeIdoso />} />
            <Route path="/consultas" element={<PaginaConsultas />} />
=======

          {/* =========================
              ROTAS PÚBLICAS
          ========================== */}

          <Route
            path="/"
            element={<PaginaLogin />}
          />

          <Route
            path="/cadastro"
            element={<PaginaCadastro />}
          />

          <Route
            path="/tipo-usuario"
            element={<PaginaTipoUsuario />}
          />

          {/* =========================
              ROTAS DE CADASTRO
          ========================== */}

          <Route
            path="/dados-cuidador"
            element={<PaginaDadosCuidador />}
          />

          <Route
            path="/dados-idoso"
            element={<PaginaDadosIdoso />}
          />

          <Route
            path="/vincular-cuidador"
            element={<PaginaVincularCuidador />}
          />

          {/* =========================
              ROTAS PROTEGIDAS - IDOSO
          ========================== */}

          <Route element={<ProtectedRoute allowedRoles={['idoso']} />}>

            <Route
              path="/home-idoso"
              element={<PaginaHomeIdoso />}
            />

>>>>>>> 178e9df631ad414fb7b4fa1952afb2efda87e39f
            <Route
              path="/medicamentos-idoso"
              element={<PaginaMedicamentosIdoso />}
            />
<<<<<<< HEAD
=======

>>>>>>> 178e9df631ad414fb7b4fa1952afb2efda87e39f
            <Route
              path="/notificacoes-idoso"
              element={<PaginaNotificacoesIdoso />}
            />
<<<<<<< HEAD
            <Route path="/doencas" element={<PaginaDoencas />} />
            <Route path="/sair" element={<PaginaSair />} />
          </Route>

          {/* Rotas protegidas exclusivas do CUIDADOR */}
          <Route element={<ProtectedRoute allowedRoles={["cuidador"]} />}>
            <Route path="/home-cuidador" element={<PaginaHomeCuidador />} />
          </Route>

          {/* Outras rotas protegidas gerais */}
          <Route element={<ProtectedRoute />}>
            <Route path="/medicamentos" element={<PaginaMedicamentos />} />
          </Route>

          {/* Redireciona qualquer rota desconhecida de volta para a tela de Login */}
          <Route path="*" element={<Navigate to="/" replace />} />
=======

          </Route>

          {/* =========================
              ROTAS PROTEGIDAS - CUIDADOR
          ========================== */}

          <Route element={<ProtectedRoute allowedRoles={['cuidador']} />}>

            <Route
              path="/home-cuidador"
              element={<PaginaHomeCuidador />}
            />

            <Route
              path="/consultas"
              element={<PaginaConsultas />}
            />

            <Route
              path="/medicamentos"
              element={<PaginaMedicamentos />}
            />

            <Route
              path="/registro-saude"
              element={<PaginaRegistroSaude />}
            />

            <Route
              path="/doencas"
              element={<PaginaDoencas />}
            />

          </Route>

          {/* Rotas acessíveis por IDOSO e CUIDADOR */}
          <Route element={<ProtectedRoute allowedRoles={['idoso', 'cuidador']} />}>
            <Route path='/consultas' element={<PaginaConsultas />} />
            <Route path='/doencas' element={<PaginaDoencas />} />
            <Route path='/medicamentos' element={<PaginaMedicamentos />} />
          </Route>

          {/* Redireciona qualquer rota desconhecida de volta para o Login */}
          <Route path='*' element={<Navigate to="/" replace />} />
          {/* =========================
              ROTA DESCONHECIDA
          ========================== */}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

>>>>>>> 178e9df631ad414fb7b4fa1952afb2efda87e39f
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
