import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PaginaLogin from './pages/PaginaLogin';
import PaginaCadastro from './pages/PaginaCadastro';
import PaginaTipoUsuario from './pages/PaginaTipoUsuario';
import PaginaDadosCuidador from './pages/PaginaDadosCuidador';
import PaginaDadosIdoso from './pages/PaginaDadosIdoso';
import PaginaVincularCuidador from './pages/PaginaVincularCuidador';
import PaginaMedicamentos from './pages/PaginaMedicamentos';
import PaginaHomeIdoso from './pages/PaginaHomeIdoso';
import PaginaHomeCuidador from './pages/PaginaHomeCuidador';
import PaginaConsultas from './pages/PaginaConsultas';
import PaginaMedicamentosIdoso from './pages/PaginaMedicamentosIdoso';
import PaginaNotificacoesIdoso from './pages/PaginaNotificacoesIdoso';
import PaginaDoencas from './pages/PaginaDoencas';

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
            <Route path='/consultas' element={<PaginaConsultas />} />
            <Route path='/medicamentos-idoso' element={<PaginaMedicamentosIdoso />} />
            <Route path="/notificacoes-idoso" element={<PaginaNotificacoesIdoso />} />
            <Route path='/doencas' element={<PaginaDoencas />} />
          </Route>

          {/* Rotas protegidas exclusivas do CUIDADOR */}
          <Route element={<ProtectedRoute allowedRoles={['cuidador']} />}>
            <Route path='/home-cuidador' element={<PaginaHomeCuidador />} />
          </Route>

          {/* Outras rotas protegidas gerais */}
          <Route element={<ProtectedRoute />}>
            <Route path='/medicamentos' element={<PaginaMedicamentos />} />
          </Route>

          {/* Redireciona qualquer rota desconhecida de volta para a tela de Login */}
          <Route path='*' element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;