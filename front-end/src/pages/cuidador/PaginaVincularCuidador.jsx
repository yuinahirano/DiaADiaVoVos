import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vincularIdosoCuidador } from '../../service/userApi';
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { criarSolicitacaoCuidador } from "../service/solicitacaoApi";
import { AuthContext } from "../contexts/AuthContext";
import "../components/styles/HomeIdoso.css";
import "../components/styles/VincularCuidador.css";

const formVazio = {
  emailIdoso: '',
  contatoEmergencia: ''
};

export function useAdicionarIdoso() {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState(formVazio);

  const [efetuarCadastro, setEfetuarCadastro] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!efetuarCadastro) return;

    async function salvar() {
      if (!user?.idCuidador) {
        setErro("Você precisa estar logado como cuidador para adicionar um idoso.");
        setEfetuarCadastro(false);
        return;
      }

      setLoading(true);
      setErro(null);

      try {
        await criarSolicitacaoCuidador({
          emailIdoso: formData.emailIdoso,
          idCuidador: user.idCuidador,
          contatoEmergencia: formData.contatoEmergencia,
          diasParaExpirar: 3
        });
        setSucesso(true);
        setFormData(formVazio);
      } catch (error) {
        console.error("Erro ao adicionar idoso:", error);
        setErro("Não foi possível enviar a solicitação. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
        setEfetuarCadastro(false);
      }
    }

    salvar();
  }, [efetuarCadastro, formData, user]);

  return {
    formData,
    handleChange,
    setEfetuarCadastro,
    sucesso,
    setSucesso,
    loading,
    erro,
    setErro
  };
}

export default function PaginaVincularCuidador() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const primeiroNome = user?.nome ? user.nome.split(" ")[0] : "";

  const {
    formData,
    handleChange,
    setEfetuarCadastro,
    sucesso,
    loading,
    erro
  } = useAdicionarIdoso();

  const handleSubmit = (e) => {
    e.preventDefault();
    setEfetuarCadastro(true);
  };

  return (
    <div className="home-idoso-container">
      <header className="home-idoso-header">
        <h1 className="home-idoso-titulo">Olá {primeiroNome}</h1>

        <button
          className="home-idoso-icone-btn"
          aria-label="Início"
          onClick={() => navigate("/home-cuidador")}
        >
          <i className="bi bi-house-door-fill"></i>
        </button>
      </header>

      <div className="vincular-cuidador-wrapper">
        <div className="vincular-cuidador-card">
          <h2 className="vincular-cuidador-titulo">Adicionar idoso</h2>

          <form onSubmit={handleSubmit}>
            <label className="vincular-cuidador-label">Email do Idoso:</label>
            <input
              className="vincular-cuidador-input"
              type="email"
              name="emailIdoso"
              value={formData.emailIdoso}
              onChange={handleChange}
              required
            />

            <label className="vincular-cuidador-label">Contato de emergência</label>
            <input
              className="vincular-cuidador-input"
              type="text"
              name="contatoEmergencia"
              value={formData.contatoEmergencia}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="vincular-cuidador-btn"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Adicionar"}
            </button>
          </form>

          {erro && <p className="vincular-cuidador-erro">{erro}</p>}
          {sucesso && (
            <p className="vincular-cuidador-sucesso">
              Solicitação enviada com sucesso!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}