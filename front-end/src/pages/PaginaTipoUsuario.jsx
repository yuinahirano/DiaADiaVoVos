import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PaginaTipoUsuario() {
  const navigate = useNavigate();

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
          Você é cuidador ou idoso?
        </h3>

        <div className="d-flex flex-column gap-3">
          <button
            className="btn fw-bold py-2 border-0"
            style={{ backgroundColor: '#FFEB60', color: '#000', borderRadius: '20px', fontSize: '1.2rem' }}
            onClick={() => navigate('/dados-cuidador')}
          >
            Sou Cuidador
          </button>

          <button
            className="btn fw-bold py-2"
            style={{ backgroundColor: '#E5ECF0', color: '#000', border: '2px solid #1A2229', borderRadius: '20px', fontSize: '1.2rem' }}
            onClick={() => navigate('/dados-idoso')}
          >
            Sou Idoso
          </button>
        </div>
      </div>
    </div>
  );
}