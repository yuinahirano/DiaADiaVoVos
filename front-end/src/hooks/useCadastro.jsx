import { useState } from 'react';
import { cadastrarUsuario } from '../service/userApi';
import api from '../service/api';

export function useCadastro() {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    senha: '',
    estadoCivil: 'SOLTEIRO',
    dataNascimento: ''
  });
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const padronizarData = (val) => {
    if (!val) return '';
    let limpo = val.trim().replace(/\//g, '-');
    if (/^\d{2}-\d{2}-\d{4}$/.test(limpo)) {
      const [dia, mes, ano] = limpo.split('-');
      return `${ano}-${mes}-${dia}`;
    }
    return limpo;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const valorTratado = name === 'dataNascimento' ? padronizarData(value) : value;
    setFormData((prev) => ({ ...prev, [name]: valorTratado }));
  };

  const toggleMostrarSenha = () => setMostrarSenha((prev) => !prev);

  const submitCadastro = async (e, onSuccess) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cpfLimpo = formData.cpf.replace(/\D/g, '');
      const dadosParaEnviar = {
        ...formData,
        cpf: cpfLimpo.length === 11 ? cpfLimpo : formData.cpf,
        dataNascimento: padronizarData(formData.dataNascimento)
      };

      // 1. Cadastra o usuário
      const response = await cadastrarUsuario(dadosParaEnviar);

      // 2. Tenta obter o ID fazendo login na rota correta (/usuarios/login)
      try {
        const resLogin = await api.post('/usuarios/login', {
          email: formData.email,
          senha: formData.senha
        });

        const token = resLogin.data?.token || resLogin.data?.login?.token;
        if (token) {
          localStorage.setItem('userToken', token);
          const payloadBase64 = token.split('.')[1];
          const payloadDecodificado = JSON.parse(atob(payloadBase64));

          if (payloadDecodificado?.id && payloadDecodificado.id !== 0) {
            localStorage.setItem('usuarioId', String(payloadDecodificado.id));
          }
        }
      } catch (errLogin) {
        console.warn('Login automático opcional não concluiu:', errLogin);
      }

      if (onSuccess) onSuccess(response);
    } catch (error) {
      console.error('Erro na API:', error.response?.data || error);
      alert(error.response?.data?.errorMessage || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return { formData, loading, mostrarSenha, handleChange, toggleMostrarSenha, submitCadastro };
}