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
    dataNascimento: '',
    tipoUsuario: 'IDOSO' // ou 'CUIDADOR' conforme a seleção do seu formulário
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitCadastro = async (e, onSuccess) => {
    e.preventDefault();
    setLoading(true);

    try {
      localStorage.removeItem('userToken');
      localStorage.removeItem('usuarioId');

      const cpfLimpo = formData.cpf.replace(/\D/g, '');
      const dadosParaEnviar = {
        ...formData,
        cpf: cpfLimpo.length === 11 ? cpfLimpo : formData.cpf,
      };

      // 1. Cadastra na tabela principal (usuarios)
      const resCadastro = await cadastrarUsuario(dadosParaEnviar);
      console.log('1. Usuário principal criado:', resCadastro);

      // 2. Faz Login automático para obter o Token JWT obrigatório
      const resLogin = await api.post(
        '/usuarios/login',
        { email: formData.email, senha: formData.senha },
        { headers: { Authorization: undefined } }
      );

      const token = resLogin.data?.token || resLogin.data?.login?.token;

      if (!token) {
        throw new Error('Não foi possível obter o token de autenticação.');
      }

      // Salva o token no localStorage
      localStorage.setItem('userToken', token);

      // 3. Cadastra na tabela específica (idosos ou cuidadores) enviando o Token no cabeçalho
      const endpointPerfil = formData.tipoUsuario === 'CUIDADOR' ? '/cuidadores' : '/idosos';

      await api.post(
        endpointPerfil,
        { ...dadosParaEnviar },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log(`2. Perfil de ${formData.tipoUsuario} vinculado com sucesso!`);

      if (onSuccess) onSuccess(resCadastro);
    } catch (error) {
      console.error('Erro durante o processo de cadastro:', error.response?.data || error);
      alert(error.response?.data?.errorMessage || error.response?.data?.message || error.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return { formData, loading, handleChange, submitCadastro };
}