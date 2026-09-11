import React from 'react';
import { useNavigate } from 'react-router-dom';
import cuidadorImg from '../assets/cuidador.png';
import idosoImg from '../assets/idoso.png';
import '../index.css'; // ou o caminho do seu arquivo de estilos

export default function PaginaTipoUsuario() {
  const navigate = useNavigate();

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ backgroundColor: '#EBF3FF', fontFamily: 'Arial, sans-serif' }}
    >
      <div className="text-center" style={{ maxWidth: '700px', width: '100%' }}>
        <h3 className="fw-bold mb-5" style={{ color: '#1A2229', fontSize: '2rem' }}>
          Qual o tipo de Usuário?
        </h3>

        <div className="d-flex gap-4 justify-content-center">
          {/* CUIDADOR */}
          <button
            onClick={() => navigate('/dados-cuidador')}
            className="btn border-0 d-flex align-items-center justify-content-center card-usuario"
            style={{
              backgroundColor: '#FFEB60',
              borderRadius: '30px',
              width: '270px',
              height: '270px',
            }}
          >
            <img
              src={cuidadorImg}
              alt="Cuidador"
              style={{ width: '75%', height: '75%', objectFit: 'contain' }}
            />
          </button>

          {/* IDOSO */}
          <button
            onClick={() => navigate('/dados-idoso')}
            className="btn d-flex align-items-center justify-content-center card-usuario"
            style={{
              backgroundColor: '#FFFFFF',
              border: 'none',
              borderRadius: '30px',
              width: '270px',
              height: '270px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            }}
          >
            <img
              src={idosoImg}
              alt="Idoso"
              style={{ width: '75%', height: '75%', objectFit: 'contain' }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}