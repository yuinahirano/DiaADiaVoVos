import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PaginaLogin from './pages/PaginaLogin';
import PaginaCadastro from './pages/PaginaCadastro';
import PaginaTipoUsuario from './pages/PaginaTipoUsuario';
import PaginaDadosCuidador from './pages/cuidador/PaginaDadosCuidador';
import PaginaDadosIdoso from './pages/idoso/PaginaDadosIdoso';
import PaginaVincularCuidador from './pages/cuidador/PaginaVincularCuidador';
import PaginaMedicamentos from './pages/cuidador/PaginaMedicamentos';
import PaginaHomeIdoso from './pages/idoso/PaginaHomeIdoso';
import PaginaHomeCuidador from './pages/cuidador/PaginaHomeCuidador';
import PaginaConsultas from './pages/cuidador/PaginaConsultas';
import PaginaMedicamentosIdoso from './pages/idoso/PaginaMedicamentosIdoso';
import PaginaNotificacoesIdoso from './pages/idoso/PaginaNotificacoesIdoso';
import PaginaDoencas from './pages/cuidador/PaginaDoencas';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<PaginaLogin />} />
          <Route path='/cadastro' element={<PaginaCadastro />} />
          <Route path='/tipo-usuario' element={<PaginaTipoUsuario />} />
          <Route path='/dados-cuidador' element={<PaginaDadosCuidador />} />
          <Route path='/dados-idoso' element={<PaginaDadosIdoso />} />
          <Route path='/vincular-cuidador' element={<PaginaVincularCuidador />} />

          {/* Rotas protegidas exclusivas do IDOSO */}
          <Route element={<ProtectedRoute allowedRoles={['idoso']} />}>
            <Route path='/home-idoso' element={<PaginaHomeIdoso />} />
            <Route path='/medicamentos-idoso' element={<PaginaMedicamentosIdoso />} />
            <Route path="/notificacoes-idoso" element={<PaginaNotificacoesIdoso />} />
          </Route>

          {/* Rotas protegidas exclusivas do CUIDADOR */}
          <Route element={<ProtectedRoute allowedRoles={['cuidador']} />}>
            <Route path='/home-cuidador' element={<PaginaHomeCuidador />} />
          </Route>

          {/* Rotas acessíveis por IDOSO e CUIDADOR */}
          <Route element={<ProtectedRoute allowedRoles={['idoso', 'cuidador']} />}>
            <Route path='/consultas' element={<PaginaConsultas />} />
            <Route path='/doencas' element={<PaginaDoencas />} />
            <Route path='/medicamentos' element={<PaginaMedicamentos />} />
          </Route>

          {/* Redireciona qualquer rota desconhecida de volta para o Login */}
          <Route path='*' element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;