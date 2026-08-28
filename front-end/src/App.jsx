import { useState } from 'react';
import './App.css';
import PaginaLogin from './pages/PaginaLogin';
import PaginaMedicamentos from './pages/PaginaMedicamentos';
import PaginaAddMedicamentos from './pages/PaginaAddMedicamento';
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<PaginaLogin/>}/>
        <Route path='/medicamentos' element={<PaginaMedicamentos/>}/>
        <Route path='/medicamentos/addMedicamento' element={<PaginaAddMedicamentos/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App