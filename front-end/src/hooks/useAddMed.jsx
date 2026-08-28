import { useState, useEffect } from "react";
import { addMedicamento } from "../service/medicamentoApi"; // Ajuste o caminho do seu arquivo de API

export function useAddMedicamento() {

    //para armazenar os dados que vao ser inseridos
    const [formData, setFormData] = useState({
        nome: '',
        dosagem: '',
        horario: '',
        frequencia: '',
        observacoes: '',
        idIdoso: ''
    });

    const [efetuarCadastro, setEfetuarCadastro] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [loading, setLoading] = useState(false);

    //pega o valor que foi inserido e ja insere também no formulário que vai ser enviado
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev, //pega o objeto como tava antes
            [name]: value//soberscreve apenas o campo que mudou
        }));
    };

    useEffect(() => {
        if (!efetuarCadastro) return;

        async function cadastrar() {
            setLoading(true);
            try {
                
                await addMedicamento(formData);
                setSucesso(true);

            } catch (error) {
                console.error("Erro no cadastro:", error);
            } finally {
                setLoading(false);
                setEfetuarCadastro(false);
            }
        }

        cadastrar();
    }, [efetuarCadastro, formData]);

    return {
        formData,
        handleChange,
        setEfetuarCadastro,
        sucesso,
        setSucesso,
        loading
    };
}