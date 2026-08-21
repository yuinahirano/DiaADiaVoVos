import { BrowserRouter, Routes, Route } from "react-router-dom"

import PaginaLogin from "./components/PaginaLogin"
import RegistroSaude from "./components/RegistroSaude"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PaginaLogin />} />
        <Route path="/registro-saude" element={<RegistroSaude />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App