import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegistroSaude() {
  const navigate = useNavigate();

  return (
    <div 
      className="min-vh-100 p-4" 
      style={{ backgroundColor: '#EBF3FE', fontFamily: 'sans-serif' }}
    >
      {/* Container Superior Branco */}
      <div 
        className="bg-white rounded-5 p-3 mb-4 d-flex align-items-center justify-content-between shadow-sm"
        style={{ borderRadius: '40px' }}
      >
        {/* Lado Esquerdo: Seta Amarela + Título */}
        <div className="d-flex align-items-center gap-3 ms-2">
          <button 
            onClick={() => navigate('/')}
            className="border-0 rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
            style={{ 
              width: '42px', 
              height: '42px', 
              backgroundColor: '#FFE600',
              cursor: 'pointer' 
            }}
          >
            <span style={{ fontSize: '1.5rem', color: '#FFF', lineHeight: '0' }}>‹</span>
          </button>
          <h2 className="fw-bold m-0" style={{ fontSize: '2.2rem', color: '#000' }}>
            Idoso 1
          </h2>
        </div>

        {/* Lado Direito: Abas de Navegação */}
        <div className="d-flex align-items-center gap-4 me-2">
          <span className="fw-bold text-dark" style={{ cursor: 'pointer', fontSize: '1rem' }}>
            Doenças
          </span>
          <span className="fw-bold text-dark" style={{ cursor: 'pointer', fontSize: '1rem' }}>
            Consultas
          </span>
          <span className="fw-bold text-dark" style={{ cursor: 'pointer', fontSize: '1rem' }}>
            Medicamentos
          </span>
          {/* Aba Ativa (Pill Amarela) */}
          <span 
            className="fw-bold px-4 py-2 rounded-pill"
            style={{ 
              backgroundColor: '#FFE600', 
              color: '#000', 
              fontSize: '1.05rem' 
            }}
          >
            Registro Saúde
          </span>
        </div>
      </div>

      {/* Grid de Métricas (2x2) */}
      <div className="row g-4 px-2">
        {/* Card 1: Frequência Cardíaca */}
        <div className="col-12 col-md-6">
          <div 
            className="card border-0 shadow-sm rounded-5 p-4 text-center"
            style={{ borderRadius: '28px' }}
          >
            <h4 className="fw-bold mb-3" style={{ color: '#8C62FF', fontSize: '1.8rem' }}>
              Frequência Cardíaca
            </h4>
            <p className="fw-bold m-0" style={{ fontSize: '2.2rem', color: '#000' }}>
              90 bpm
            </p>
          </div>
        </div>

        {/* Card 2: Saturação do Sangue */}
        <div className="col-12 col-md-6">
          <div 
            className="card border-0 shadow-sm rounded-5 p-4 text-center"
            style={{ borderRadius: '28px' }}
          >
            <h4 className="fw-bold mb-3" style={{ color: '#8C62FF', fontSize: '1.8rem' }}>
              Saturação do Sangue
            </h4>
            <p className="fw-bold m-0" style={{ fontSize: '2.2rem', color: '#000' }}>
              97%
            </p>
          </div>
        </div>

        {/* Card 3: Peso */}
        <div className="col-12 col-md-6">
          <div 
            className="card border-0 shadow-sm rounded-5 p-4 text-center"
            style={{ borderRadius: '28px' }}
          >
            <h4 className="fw-bold mb-3" style={{ color: '#8C62FF', fontSize: '1.8rem' }}>
              Peso
            </h4>
            <p className="fw-bold m-0" style={{ fontSize: '2.2rem', color: '#000' }}>
              60kg
            </p>
          </div>
        </div>

        {/* Card 4: Data de Cadastro */}
        <div className="col-12 col-md-6">
          <div 
            className="card border-0 shadow-sm rounded-5 p-4 text-center"
            style={{ borderRadius: '28px' }}
          >
            <h4 className="fw-bold mb-3" style={{ color: '#8C62FF', fontSize: '1.8rem' }}>
              Data de Cadastro
            </h4>
            <p className="fw-bold m-0" style={{ fontSize: '2.2rem', color: '#000' }}>
              dd/MM/AAAA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}