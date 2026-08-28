import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import imgUpload from '../assets/salvarimg.png';

export default function PaginaAdicionarFoto() {
  const [preview, setPreview] = useState(null);
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleFinalizar = async () => {
    setLoading(true);
    try {
      alert('Cadastro finalizado com sucesso!');
      navigate('/');
    } catch (error) {
      alert('Erro ao salvar a foto.');
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
        className="bg-white p-4 p-md-5 w-100 shadow-sm" 
        style={{ maxWidth: '460px', borderRadius: '35px' }}
      >
        <h3 className="fw-bold text-center mb-4" style={{ color: '#000' }}>
          Deseja adicionar uma foto?
        </h3>

        <div className="d-flex align-items-center justify-content-between my-4 px-2">
          <span className="fw-bold fs-5" style={{ color: '#000' }}>
            Selecione uma foto:
          </span>

          <label style={{ cursor: 'pointer' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFotoChange} 
              className="d-none" 
            />
            {preview ? (
              <img 
                src={preview} 
                alt="Preview" 
                style={{ 
                  width: '90px', 
                  height: '90px', 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  border: '3px solid #FFEB60'
                }} 
              />
            ) : (
              <img 
                src={imgUpload} 
                alt="Adicionar Foto" 
                style={{ 
                  width: '90px', 
                  height: '90px', 
                  objectFit: 'contain'
                }} 
              />
            )}
          </label>
        </div>

        {/* Botão Finalizar */}
        <div className="text-center mt-4">
          <button 
            type="button"
            onClick={handleFinalizar}
            disabled={loading}
            className="btn fw-bold px-4 py-2 border-0 w-100"
            style={{ backgroundColor: '#FFEB60', color: '#000', fontSize: '1.2rem', borderRadius: '20px' }}
          >
            {loading ? 'Salvando...' : 'Concluir'}
          </button>
        </div>
      </div>
    </div>
  );
}