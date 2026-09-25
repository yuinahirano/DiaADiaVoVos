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
import PaginaConsultas from './pages/cuidador/PaginaConsultasCuidador';
import PaginaDoencas from './pages/cuidador/PaginaDoencasCuidador';

// Páginas do idoso
import PaginaDadosIdoso from './pages/idoso/PaginaDadosIdoso';
import PaginaHomeIdoso from './pages/idoso/PaginaHomeIdoso';
import PaginaMedicamentosIdoso from './pages/idoso/PaginaMedicamentosIdoso';
import PaginaNotificacoesIdoso from './pages/idoso/PaginaNotificacoesIdoso';
import PaginaConsultasIdoso from './pages/idoso/PaginaConsultasIdoso';
import PaginaDoencasIdoso from './pages/idoso/PaginaDoencasIdoso';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

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

            <Route
              path="/medicamentos-idoso"
              element={<PaginaMedicamentosIdoso />}
            />
            <Route
              path="/notificacoes-idoso"
              element={<PaginaNotificacoesIdoso />}
            />
            <Route
              path="/consultas-idoso"
              element={<PaginaConsultasIdoso />}
            />

            <Route
              path="/doencas-idoso"
              element={<PaginaDoencasIdoso />}
            />

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

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
