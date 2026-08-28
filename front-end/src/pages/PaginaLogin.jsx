import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo_DiaADia.png';
import { login } from '../service/userApi';

export default function PaginaLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleMostrarSenha = () => {
    setMostrarSenha(!mostrarSenha);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await login(email, senha);
      if (token) {
        localStorage.setItem('token', token);
        alert('Login efetuado com sucesso!');
      }
    } catch (error) {
      const mensagemErro = error.response?.data?.errorMessage || error.response?.data?.message || 'Email ou senha inválidos.';
      alert(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center p-3" 
      style={{ backgroundColor: '#EBF3FF', fontFamily: 'Arial, sans-serif' }}
    >
      <div 
        className="bg-white p-4 p-md-5 w-100 shadow-sm" 
        style={{ 
          maxWidth: '460px', 
          borderRadius: '35px'
        }}
      >
        {/* Logo */}
        <div className="text-center mb-4">
          <img 
            src={logo} 
            alt="Dia a Dia Vovôs" 
            style={{ width: '220px', height: 'auto' }} 
          />
        </div>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="mb-3 d-flex align-items-center gap-2">
            <i className="bi bi-person-fill fs-3" style={{ color: '#000' }}></i>
            <input 
              type="email" 
              placeholder="Seu e-mail" 
              className="form-control px-3 py-2 fw-bold" 
              style={{ 
                backgroundColor: '#E5ECF0', 
                border: '2px solid #1A2229', 
                borderRadius: '16px' 
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          {/* Senha */}
          <div className="mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-lock-fill fs-3" style={{ color: '#000' }}></i>
            <div className="position-relative w-100">
              <input 
                type={mostrarSenha ? "text" : "password"} 
                placeholder="Sua senha" 
                className="form-control px-3 py-2 pe-5 fw-bold" 
                style={{ 
                  backgroundColor: '#E5ECF0', 
                  border: '2px solid #1A2229', 
                  borderRadius: '16px' 
                }}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required 
              />
              <button
                type="button"
                onClick={toggleMostrarSenha}
                className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent pe-3"
                style={{ cursor: 'pointer' }}
              >
                <i className={`bi ${mostrarSenha ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`} style={{ fontSize: '1.2rem', color: '#000' }}></i>
              </button>
            </div>
          </div>

          {/* Botão Entrar */}
          <div className="text-center mt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="btn fw-bold px-4 py-2 border-0 w-100"
              style={{ 
                backgroundColor: '#FFEB60', 
                color: '#000', 
                fontSize: '1.2rem',
                borderRadius: '20px'
              }}
            >
              {loading ? 'Entrando...' : 'Entrar no Painel'}
            </button>
          </div>
        </form>

        {/* Link Criar Novo Usuário */}
        <div className="text-center mt-4">
          <button 
            type="button"
            onClick={() => navigate('/cadastro')}
            className="btn btn-link text-black fw-bold text-decoration-underline p-0 border-0"
            style={{ fontSize: '1.1rem' }}
          >
            Criar um novo usuário.
          </button>
        </div>
      </div>
    </div>
  );
}