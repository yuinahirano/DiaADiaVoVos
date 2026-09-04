import React from 'react';
import { useNavigate } from 'react-router-dom';
import imgCuidador from '../assets/cuidador.png';
import imgIdoso from '../assets/idoso.png';

export default function PaginaTipoUsuario() {
  const navigate = useNavigate();

  const handleAvancar = (tipo) => {
    if (tipo === 'CUIDADOR') {
      navigate('/completar-cuidador');
    } else if (tipo === 'IDOSO') {
      navigate('/completar-idoso');
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-3" 
      style={{ backgroundColor: '#EBF3FF', fontFamily: 'Arial, sans-serif' }}
    >
      <h2 className="fw-bold mb-4 text-center" style={{ color: '#000', fontSize: '2rem' }}>
        Qual o tipo de Usuário?
      </h2>

      <div className="d-flex flex-row justify-content-center gap-4 flex-wrap">
        {/* Card Cuidador */}
        <button
          onClick={() => handleAvancar('CUIDADOR')}
          className="btn p-0 border-0 bg-transparent"
          style={{
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img 
            src={imgCuidador} 
            alt="Cuidador" 
            style={{ 
              width: '200px', 
              height: '200px', 
              borderRadius: '28px',
              objectFit: 'cover' 
            }} 
          />
        </button>

        {/* Card Idoso */}
        <button
          onClick={() => handleAvancar('IDOSO')}
          className="btn p-0 border-0 bg-transparent"
          style={{
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img 
            src={imgIdoso} 
            alt="Idoso" 
            style={{ 
              width: '200px', 
              height: '200px', 
              borderRadius: '28px',
              objectFit: 'cover' 
            }} 
          />
        </button>
      </div>
    </div>
  );
}