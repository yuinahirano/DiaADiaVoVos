import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PaginaDadosCuidador() {
  const [telefone, setTelefone] = useState('');
  const navigate = useNavigate();

  const handleProximo = (e) => {
    e.preventDefault();
    navigate('/adicionar-foto');
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center p-3" 
      style={{ backgroundColor: '#EBF3FF', fontFamily: 'Arial, sans-serif' }}
    >
      <div 
        className="bg-white p-4 p-md-5 w-100 shadow-sm text-center" 
        style={{ maxWidth: '460px', borderRadius: '35px' }}
      >
        <h3 className="fw-bold mb-4" style={{ color: '#000' }}>
          Insira seu número de telefone
        </h3>

        <form onSubmit={handleProximo}>
          {/* Campo Telefone */}
          <div className="mb-4 d-flex align-items-center justify-content-center gap-2">
            <i className="bi bi-telephone-fill text-warning fs-3"></i>
            <input 
              type="tel" 
              placeholder="( ) ____ - ____" 
              className="form-control px-3 py-2 fw-bold text-center"
              style={{ backgroundColor: '#E5ECF0', border: '2px solid #1A2229', borderRadius: '16px', maxWidth: '240px' }}
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
          </div>

          {/* Botão Próximo */}
          <div className="text-center mt-4">
            <button 
              type="submit" 
              className="btn fw-bold px-4 py-2 border-0 w-100"
              style={{ backgroundColor: '#FFEB60', color: '#000', fontSize: '1.2rem', borderRadius: '20px' }}
            >
              Próximo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}