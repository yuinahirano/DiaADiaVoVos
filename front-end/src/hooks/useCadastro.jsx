import { useState } from "react";
import { cadastrarUsuario } from "../service/userApi";

export function useCadastro() {
    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        email: '',
        senha: '',
        dataNascimento: '',
        estadoCivil: 'SOLTEIRO'
    });

    const [loading, setLoading] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleMostrarSenha = () => {
        setMostrarSenha((prev) => !prev);
    };

    const submitCadastro = async (e, onSuccess) => {
        e.preventDefault();
        setLoading(true);
        try {
            const resposta = await cadastrarUsuario(formData);
            
            // Guarda o ID do usuário recém-criado para associar nos passos do idoso/cuidador
            if (resposta?.id) {
                localStorage.setItem('usuarioId', resposta.id);
            }

            if (onSuccess) onSuccess();
        } catch (error) {
            const mensagemServidor = error.response?.data?.errorMessage || error.response?.data?.message || "Erro ao realizar cadastro.";
            alert(mensagemServidor);
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        loading,
        mostrarSenha,
        handleChange,
        toggleMostrarSenha,
        submitCadastro
    };
}

export default useCadastro;