import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'; //[cite: 8]
import PaginaLogin from './pages/PaginaLogin'; //[cite: 8]
import PaginaMedicamentos from './pages/PaginaMedicamentos'; //[cite: 8]
import PaginaCadastro from './pages/PaginaCadastro';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<PaginaLogin/>}/> {/*[cite: 8] */}
        <Route path='/cadastro' element={<PaginaCadastro/>}/>
        <Route path='/medicamentos' element={<PaginaMedicamentos/>}/> {/*[cite: 8] */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;