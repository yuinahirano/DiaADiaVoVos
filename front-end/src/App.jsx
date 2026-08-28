import { useState } from 'react';
import './App.css';
import PaginaLogin from './pages/PaginaLogin';
import PaginaMedicamentos from './pages/PaginaMedicamentos';
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<PaginaLogin/>}/>
        <Route path='/medicamentos' element={<PaginaMedicamentos/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App