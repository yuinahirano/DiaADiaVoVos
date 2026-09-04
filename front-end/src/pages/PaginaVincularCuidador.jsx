import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vincularIdosoCuidador } from '../service/userApi';

export default function PaginaVincularCuidador() {
  const [idCuidador, setIdCuidador] = useState('');
  const [telefoneEmergencia, setTelefoneEmergencia] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVincular = async (e) => {
    e.preventDefault();
    setLoading(true);

    const idIdoso = localStorage.getItem('idosoId');

    try {
      await vincularIdosoCuidador({
        idIdoso,
        idCuidador,
        telefoneEmergencia
      });

      navigate('/adicionar-foto');
    } catch (error) {
      const msg = error.response?.data?.errorMessage || error.response?.data?.message || 'Erro ao vincular cuidador.';
      alert(msg);
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
        className="bg-white p-4 p-md-5 w-100 shadow-sm text-center" 
        style={{ maxWidth: '460px', borderRadius: '35px' }}
      >
        <h3 className="fw-bold mb-4" style={{ color: '#000' }}>
          Vincular Cuidador & Emergência
        </h3>

        <form onSubmit={handleVincular}>
          {/* ID do Cuidador */}
          <div className="mb-3 text-start">
            <label className="fw-bold mb-1">Código do Cuidador:</label>
            <input 
              type="text" 
              placeholder="Digite o ID do cuidador" 
              className="form-control px-3 py-2 fw-bold"
              style={{ backgroundColor: '#E5ECF0', border: '2px solid #1A2229', borderRadius: '16px' }}
              value={idCuidador}
              onChange={(e) => setIdCuidador(e.target.value)}
              required
            />
          </div>

          {/* Telefone de Emergência */}
          <div className="mb-4 text-start">
            <label className="fw-bold mb-1">Telefone de Emergência:</label>
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-telephone-fill text-warning fs-4"></i>
              <input 
                type="tel" 
                placeholder="(11) 99999-9999" 
                className="form-control px-3 py-2 fw-bold"
                style={{ backgroundColor: '#E5ECF0', border: '2px solid #1A2229', borderRadius: '16px' }}
                value={telefoneEmergencia}
                onChange={(e) => setTelefoneEmergencia(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn fw-bold px-4 py-2 border-0 w-100"
            style={{ backgroundColor: '#FFEB60', color: '#000', fontSize: '1.2rem', borderRadius: '20px' }}
          >
            {loading ? 'Salvando...' : 'Próximo'}
          </button>
        </form>
      </div>
    </div>
  );
}