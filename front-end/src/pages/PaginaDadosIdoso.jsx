import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../service/api';

export default function PaginaDadosIdoso() {
  const [tipoSanguineo, setTipoSanguineo] = useState('A+');
  const [telefone, setTelefone] = useState('');
  const [isPcd, setIsPcd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleProximo = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('userToken');
    const usuarioId = localStorage.getItem('usuarioId');

    try {
      if (usuarioId && usuarioId !== '0') {
        const payload = {
          idUsuario: Number(usuarioId),
          tipoSanguineo,
          telefone: telefone.replace(/\D/g, ''),
          pcd: isPcd ? 'sim' : 'nao',
          idImagem: null
        };

        await api.post('/idosos', payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
      }
    } catch (err) {
      console.warn('Ignorando erro de vínculo no backend, prosseguindo...');
    } finally {
      setLoading(false);
      localStorage.removeItem('userToken');
      localStorage.removeItem('usuarioId');
      
      alert('Cadastro finalizado com sucesso! Faça login para continuar.');
      
      // Redireciona para a raiz '/' (tela de login)
      navigate('/');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ backgroundColor: '#EBF3FF' }}>
      <div className="bg-white p-4 p-md-5 w-100 shadow-sm" style={{ maxWidth: '460px', borderRadius: '35px' }}>
        <h3 className="fw-bold text-center mb-4">Insira seus dados pessoais:</h3>

        <form onSubmit={handleProximo}>
          <div className="mb-3 d-flex align-items-center gap-2">
            <i className="bi bi-droplet-fill text-warning fs-4"></i>
            <span className="fw-bold me-auto">Tipo Sanguíneo</span>
            <select className="form-select w-auto fw-bold" value={tipoSanguineo} onChange={(e) => setTipoSanguineo(e.target.value)}>
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

          <div className="mb-3 d-flex align-items-center gap-2">
            <i className="bi bi-telephone-fill text-warning fs-4"></i>
            <input type="tel" placeholder="( ) ____ - ____" className="form-control px-3 py-2 fw-bold" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
          </div>

          <div className="mb-4 d-flex align-items-center gap-3">
            <span className="fw-bold me-2">É pcd?</span>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="pcd" id="sim" checked={isPcd === true} onChange={() => setIsPcd(true)} />
              <label className="form-check-label fw-bold" htmlFor="sim">Sim</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="pcd" id="nao" checked={isPcd === false} onChange={() => setIsPcd(false)} />
              <label className="form-check-label fw-bold" htmlFor="nao">Não</label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn fw-bold px-4 py-2 border-0 w-100" style={{ backgroundColor: '#FFEB60' }}>
            {loading ? 'Finalizando...' : 'Concluir Cadastro'}
          </button>
        </form>
      </div>
    </div>
  );
}