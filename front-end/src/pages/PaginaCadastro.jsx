import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCadastro } from '../hooks/useCadastro';

export default function PaginaCadastro() {
  const navigate = useNavigate();
  const { 
    formData, 
    loading, 
    mostrarSenha, 
    handleChange, 
    toggleMostrarSenha, 
    submitCadastro 
  } = useCadastro();

  const handleSubmit = (e) => {
    submitCadastro(e, () => {
      alert('Cadastro realizado com sucesso!');
      navigate('/tipo-usuario');
    });
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center p-3" 
      style={{ backgroundColor: '#EBF3FF', fontFamily: 'Arial, sans-serif' }}
    >
      <div 
        className="bg-white p-4 p-md-5 w-100 shadow-sm" 
        style={{ 
          maxWidth: '450px', 
          borderRadius: '35px'
        }}
      >
        <h2 className="fw-bold text-center mb-4" style={{ fontSize: '2.2rem', color: '#000' }}>
          Criar conta
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Nome Completo */}
          <div className="mb-3">
            <label className="fw-bold mb-1 d-block" style={{ color: '#000', fontSize: '1.1rem' }}>
              Nome Completo:
            </label>
            <input 
              type="text" 
              name="nome"
              placeholder="Digite seu nome completo"
              className="form-control px-3 py-2" 
              style={{ 
                backgroundColor: '#E5ECF0', 
                border: '2px solid #1A2229', 
                borderRadius: '12px' 
              }}
              value={formData.nome}
              onChange={handleChange}
              required 
            />
          </div>

          {/* CPF */}
          <div className="mb-3">
            <label className="fw-bold mb-1 d-block" style={{ color: '#000', fontSize: '1.1rem' }}>
              Cpf:
            </label>
            <input 
              type="text" 
              name="cpf"
              placeholder="000.000.000-00"
              className="form-control px-3 py-2" 
              style={{ 
                backgroundColor: '#E5ECF0', 
                border: '2px solid #1A2229', 
                borderRadius: '12px' 
              }}
              value={formData.cpf}
              onChange={handleChange}
              required 
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="fw-bold mb-1 d-block" style={{ color: '#000', fontSize: '1.1rem' }}>
              Email:
            </label>
            <input 
              type="email" 
              name="email"
              placeholder="seuemail@exemplo.com"
              className="form-control px-3 py-2" 
              style={{ 
                backgroundColor: '#E5ECF0', 
                border: '2px solid #1A2229', 
                borderRadius: '12px' 
              }}
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          {/* Senha */}
          <div className="mb-3">
            <label className="fw-bold mb-1 d-block" style={{ color: '#000', fontSize: '1.1rem' }}>
              Senha:
            </label>
            <div className="position-relative">
              <input 
                type={mostrarSenha ? "text" : "password"} 
                name="senha"
                placeholder="********"
                className="form-control px-3 py-2 pe-5 fw-bold" 
                style={{ 
                  backgroundColor: '#E5ECF0', 
                  border: '2px solid #1A2229', 
                  borderRadius: '12px'
                }}
                value={formData.senha}
                onChange={handleChange}
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

          {/* Estado Civil */}
          <div className="mb-3">
            <label className="fw-bold mb-1 d-block" style={{ color: '#000', fontSize: '1.1rem' }}>
              Estado Civil:
            </label>
            <select
              name="estadoCivil"
              className="form-select px-3 py-2 fw-bold"
              style={{ 
                backgroundColor: '#E5ECF0', 
                border: '2px solid #1A2229', 
                borderRadius: '12px',
                color: '#000'
              }}
              value={formData.estadoCivil}
              onChange={handleChange}
              required
            >
              <option value="SOLTEIRO">Solteiro(a)</option>
              <option value="CASADO">Casado(a)</option>
              <option value="DIVORCIADO">Divorciado(a)</option>
              <option value="VIUVO">Viúvo(a)</option>
            </select>
          </div>

          {/* Data de nascimento */}
          <div className="mb-4 d-flex align-items-center gap-2">
            <label className="fw-bold m-0" style={{ color: '#000', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
              Data de nascimento:
            </label>
            <input 
              type="text" 
              name="dataNascimento"
              placeholder="AAAA-MM-DD"
              className="form-control text-center fw-bold px-2 py-1" 
              style={{ 
                backgroundColor: '#E5ECF0', 
                border: '2px solid #1A2229', 
                borderRadius: '12px',
                maxWidth: '160px'
              }}
              value={formData.dataNascimento}
              onChange={handleChange}
              required 
            />
          </div>

          {/* Botão Próximo */}
          <div className="text-center mt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="btn fw-bold px-5 py-2 border-0"
              style={{ 
                backgroundColor: '#FFEB60', 
                color: '#000', 
                fontSize: '1.2rem',
                borderRadius: '20px',
                minWidth: '200px'
              }}
            >
              {loading ? 'Cadastrando...' : 'Próximo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}