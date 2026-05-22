import usuarioRepository from "../repositories/usuarioRepository.js";
import axios from "axios";
import { Usuario } from "../models/Usuario.js";
import { Enderecos } from "../models/Enderecos.js";
import { validarCPF } from "../utils/validarCpf.js";
import { limparNumero } from "../utils/limparNumero.js";
import { criptografarSenha } from "../utils/criptografarSenha.js";

const consultaCep = async (cep) => {
    const cepRegex = /^[0-9]{8}$/;
    if (!cepRegex.test(cep)) throw new Error('CEP inválido');

    const respApi = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    if (!respApi.data || respApi.data.erro) throw new Error('CEP não encontrado');

    return {
        uf: respApi.data.uf,
        logradouro: respApi.data.logradouro,
        cidade: respApi.data.localidade,
        bairro: respApi.data.bairro
    };
};

const usuarioController = {
    criar: async (req, res) => {
        try {
            const { nome, cpf, email, senha, cep, numero, complemento } = req.body;

            if (!validarCPF(cpf))
                return res.status(400).json({ message: "CPF inválido" });

            limparNumero(numero);

            const senhaCriptografada = await criptografarSenha(senha);
            const enderecoCep = await consultaCep(cep);
            const { uf, logradouro, cidade, bairro } = enderecoCep;

            const usuario = Usuario.criar({ nome, cpf, email, senha: senhaCriptografada });
            const enderecoObj = Enderecos.criar({ uf, logradouro, cidade, bairro, numero, cep, complemento });
            const result = await usuarioRepository.criar(usuario, enderecoObj);

            return res.status(201).json(result);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },

    listarTodos: async (req, res) => {
        try {
            const usuarios = await usuarioRepository.listarTodos();
            return res.status(200).json(usuarios);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },

    buscarPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const usuario = await usuarioRepository.buscarPorId(id);

            if (!usuario)
                return res.status(404).json({ message: 'Usuário não encontrado' });

            return res.status(200).json(usuario);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },

    atualizar: async (req, res) => {
        try {
            const { id } = req.params;
            const { nome, email, senha, cep, numero, complemento } = req.body;

            const usuarioExistente = await usuarioRepository.buscarPorId(id);
            if (!usuarioExistente)
                return res.status(404).json({ message: 'Usuário não encontrado' });

            let senhaCriptografada = usuarioExistente.senha;
            if (senha) {
                if (senha.length < 6)
                    return res.status(400).json({ message: "Senha deve ter no mínimo 6 caracteres" });
                senhaCriptografada = await criptografarSenha(senha);
            }

            let enderecoObj = null;
            if (cep) {
                limparNumero(numero);
                const enderecoCep = await consultaCep(cep);
                const { uf, logradouro, cidade, bairro } = enderecoCep;
                enderecoObj = Enderecos.criar({ uf, logradouro, cidade, bairro, numero, cep, complemento });
            }

            const dadosAtualizados = { nome, email, senha: senhaCriptografada };
            const result = await usuarioRepository.atualizar(id, dadosAtualizados, enderecoObj);

            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },

    deletar: async (req, res) => {
        try {
            const { id } = req.params;

            const usuarioExistente = await usuarioRepository.buscarPorId(id);
            if (!usuarioExistente)
                return res.status(404).json({ message: 'Usuário não encontrado' });

            await usuarioRepository.deletar(id);

            return res.status(200).json({ message: 'Usuário deletado com sucesso' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },
};

export default usuarioController;