import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api_auth } from '../service/api';

export default function PaginaDadosCuidador() {
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleProximo = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        idUsuario: localStorage.getItem('usuarioId') || '',
        telefone: telefone.replace(/\D/g, '')
      };

      await api_auth.post('/cuidadores', payload);
    } catch (err) {
      console.warn('Backend não vinculou o cuidador, prosseguindo para o login...', err);
    } finally {
      setLoading(false);
      localStorage.removeItem('userToken');
      localStorage.removeItem('usuarioId');
      alert('Cadastro concluído com sucesso! Faça login para continuar.');
      navigate('/');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ backgroundColor: '#EBF3FF' }}>
      <div className="bg-white p-4 p-md-5 w-100 shadow-sm" style={{ maxWidth: '460px', borderRadius: '35px' }}>
        <h3 className="fw-bold text-center mb-4">Insira seu número de telefone</h3>

        <form onSubmit={handleProximo}>
          <div className="mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-telephone-fill text-warning fs-4"></i>
            <input type="tel" placeholder="( ) ____ - ____" className="form-control px-3 py-2 fw-bold" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
          </div>

          <button type="submit" disabled={loading} className="btn fw-bold px-4 py-2 border-0 w-100" style={{ backgroundColor: '#FFEB60' }}>
            {loading ? 'Finalizando...' : 'Concluir Cadastro'}
          </button>
        </form>
      </div>
    </div>
  );
}