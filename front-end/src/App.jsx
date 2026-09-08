
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

          <Route element={<ProtectedRoute />}>
            <Route path='/medicamentos' element={<PaginaMedicamentos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

