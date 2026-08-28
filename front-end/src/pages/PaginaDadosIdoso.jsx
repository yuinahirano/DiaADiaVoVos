import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PaginaDadosIdoso() {
  const [tipoSanguineo, setTipoSanguineo] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isPcd, setIsPcd] = useState(false);
  const navigate = useNavigate();

  const handleProximo = (e) => {
    e.preventDefault();
    // Salva os dados do idoso ou avança para a foto
    navigate('/adicionar-foto');
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center p-3" 
      style={{ backgroundColor: '#EBF3FF', fontFamily: 'Arial, sans-serif' }}
    >
      <div 
        className="bg-white p-4 p-md-5 w-100 shadow-sm" 
        style={{ maxWidth: '460px', borderRadius: '35px' }}
      >
        <h3 className="fw-bold text-center mb-4" style={{ color: '#000' }}>
          Insira seus dados pessoais:
        </h3>

        <form onSubmit={handleProximo}>
          {/* Tipo Sanguíneo */}
          <div className="mb-3 d-flex align-items-center gap-2">
            <i className="bi bi-droplet-fill text-warning fs-4"></i>
            <span className="fw-bold me-auto">Tipo Sanguíneo</span>
            <select 
              className="form-select w-auto fw-bold"
              style={{ borderRadius: '12px', border: '2px solid #000' }}
              value={tipoSanguineo}
              onChange={(e) => setTipoSanguineo(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          {/* Telefone */}
          <div className="mb-3 d-flex align-items-center gap-2">
            <i className="bi bi-telephone-fill text-warning fs-4"></i>
            <input 
              type="tel" 
              placeholder="( ) ____ - ____" 
              className="form-control px-3 py-2 fw-bold"
              style={{ backgroundColor: '#E5ECF0', border: '2px solid #1A2229', borderRadius: '16px' }}
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
          </div>

          {/* É PCD? */}
          <div className="mb-4 d-flex align-items-center gap-3">
            <span className="fw-bold me-2">É pcd?</span>
            <div className="form-check form-check-inline">
              <input 
                className="form-check-input" 
                type="radio" 
                name="pcdOptions" 
                id="pcdSim" 
                checked={isPcd === true}
                onChange={() => setIsPcd(true)}
              />
              <label className="form-check-label fw-bold" htmlFor="pcdSim">Sim</label>
            </div>
            <div className="form-check form-check-inline">
              <input 
                className="form-check-input" 
                type="radio" 
                name="pcdOptions" 
                id="pcdNao" 
                checked={isPcd === false}
                onChange={() => setIsPcd(false)}
              />
              <label className="form-check-label fw-bold" htmlFor="pcdNao">Não</label>
            </div>
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