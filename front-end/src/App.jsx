import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Home from './pages/Home';
import CuidadorDashbord from './pages/CuidadorDashbord';
import IdosoDashboard from './pages/IdosoDashboard';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext'; 
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Login/>}/>
            <Route path='/home' element={<Home/>}/>
            <Route path='/cuidador-dashboard' element={<CuidadorDashbord/>}/>
            <Route path='/idoso-dashboard' element={<IdosoDashboard/>}/>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;