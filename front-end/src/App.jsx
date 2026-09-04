import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import PaginaLogin from './pages/PaginaLogin';
import PaginaMedicamentos from './pages/PaginaMedicamentos';
import PaginaAddMedicamentos from './pages/PaginaAddMedicamento';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PaginaCadastro from './pages/PaginaCadastro';
import PaginaTipoUsuario from './pages/PaginaTipoUsuario';
import PaginaDadosIdoso from './pages/PaginaDadosIdoso';
import PaginaDadosCuidador from './pages/PaginaDadosCuidador';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<PaginaLogin/>}/>
        <Route path='/cadastro' element={<PaginaCadastro/>}/>
        <Route path='/medicamentos' element={<PaginaMedicamentos/>}/>
        {/* <Route path='/medicamentos/addMedicamento' element={<PaginaAddMedicamentos/>}/> */}
        
        {/* Novas rotas do fluxo de cadastro */}
        <Route path='/tipo-usuario' element={<PaginaTipoUsuario/>}/>
        <Route path='/completar-idoso' element={<PaginaDadosIdoso/>}/>
        <Route path='/completar-cuidador' element={<PaginaDadosCuidador/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;