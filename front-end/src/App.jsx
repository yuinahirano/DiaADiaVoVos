
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './contexts/ThemeContext';
import './components/styles/TemaEscuro.css';
import TemaCuidador from './components/TemaCuidador';

// Páginas públicas
import PaginaSobre from './pages/PaginaSobre';
import PaginaLogin from './pages/PaginaLogin';
import PaginaCadastro from './pages/PaginaCadastro';
import PaginaTipoUsuario from './pages/PaginaTipoUsuario';

// Páginas do cuidador
import PaginaDadosCuidador from './pages/cuidador/PaginaDadosCuidador';
import PaginaHomeCuidador from './pages/cuidador/PaginaHomeCuidador';
import PaginaVincularCuidador from './pages/cuidador/PaginaVincularCuidador';
import PaginaMedicamentos from './pages/cuidador/PaginaMedicamentos';
import PaginaAddMedicamento from './pages/cuidador/PaginaAddMedicamento';
import PaginaRegistroSaude from './pages/cuidador/PaginaRegistroSaude';
import PaginaConsultas from './pages/cuidador/PaginaConsultasCuidador';
import PaginaAddConsulta from './pages/cuidador/PaginaAddConsulta';
import PaginaDoencas from './pages/cuidador/PaginaDoencasCuidador';
import PaginaConfiguracao from './pages/cuidador/PaginaConfiguracao';

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
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<PaginaSobre />} />
            <Route path="/login" element={<PaginaLogin />} />
            <Route path="/cadastro" element={<PaginaCadastro />} />
            <Route path="/tipo-usuario" element={<PaginaTipoUsuario />} />

            {/* Cadastro de dados */}
            <Route
              path="/dados-cuidador"
              element={<PaginaDadosCuidador />}
            />
            <Route
              path="/dados-idoso"
              element={<PaginaDadosIdoso />}
            />

            {/* Rotas protegidas do idoso */}
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

            {/* Rotas protegidas do cuidador */}
            <Route element={<ProtectedRoute allowedRoles={['cuidador']} />}>
              <Route element={<TemaCuidador />}>
                <Route
                  path="/home-cuidador"
                  element={<PaginaHomeCuidador />}
                />

                <Route
                  path="/consultas"
                  element={<PaginaConsultas />}
                />
                <Route
                  path="/consultas/nova"
                  element={<PaginaAddConsulta />}
                />
                <Route
                  path="/consultas/editar"
                  element={<PaginaAddConsulta />}
                />

                <Route
                  path="/medicamentos"
                  element={<PaginaMedicamentos />}
                />
                <Route
                  path="/medicamentos/novo"
                  element={<PaginaAddMedicamento />}
                />
                <Route
                  path="/medicamentos/editar"
                  element={<PaginaAddMedicamento />}
                />

                <Route
                  path="/registro-saude"
                  element={<PaginaRegistroSaude />}
                />
                <Route
                  path="/doencas"
                  element={<PaginaDoencas />}
                />
                <Route
                  path="/configuracoes"
                  element={<PaginaConfiguracao />}
                />
                <Route
                  path="/vincular-cuidador"
                  element={<PaginaVincularCuidador />}
                />
              </Route>
            </Route>

            {/* Qualquer rota inexistente */}
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
