export class Usuario {

    #id
    #nome
    #cpf
    #email
    #senha
    #dataNascimento
    #estadoCivil

    constructor(
        nome,
        cpf,
        email,
        senha,
        dataNascimento,
        estadoCivil,
        id
    ) {
        this.id = id;
        this.nome = nome;
        this.cpf = cpf;
        this.email = email;
        this.senha = senha;
        this.dataNascimento = dataNascimento;
        this.estadoCivil = estadoCivil;
    }

    // GETTERS E SETTERS

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#validarId(value);
        this.#id = value;
    }

    get nome() {
        return this.#nome;
    }

    set nome(value) {
        this.#validarNome(value);
        this.#nome = value;
    }

    get cpf() {
        return this.#cpf;
    }

    set cpf(value) {
        this.#validarCpf(value);
        this.#cpf = value;
    }

    get email() {
        return this.#email;
    }

    set email(value) {
        this.#validarEmail(value);
        this.#email = value;
    }

    get senha() {
        return this.#senha;
    }

    set senha(value) {
        this.#validarSenha(value);
        this.#senha = value;
    }

    get dataNascimento() {
        return this.#dataNascimento;
    }

    set dataNascimento(value) {
        this.#dataNascimento = value;
    }

    get estadoCivil() {
        return this.#estadoCivil;
    }

    set estadoCivil(value) {
        this.#estadoCivil = value;
    }

    // VALIDAÇÕES

    #validarId(value) {
        if (value != null && value.trim() === '') {
            throw new Error('Verifique o id informado');
        }
    }

    #validarNome(value) {
        if (!value || value.trim().length < 3 || value.trim().length > 100) {
            throw new Error('O nome deve ter entre 3 e 100 caracteres');
        }
    }

    #validarCpf(value) {
        if (!value || value.length !== 11) {
            throw new Error('CPF inválido');
        }
    }

    #validarEmail(value) {
        if (!value || !value.includes('@')) {
            throw new Error('Email inválido');
        }
    }

    #validarSenha(value) {
        if (!value || value.length < 6) {
            throw new Error('A senha deve ter no mínimo 6 caracteres');
        }
    }

    // FACTORY METHODS

    static criar(dados) {
        return new Usuario(
            dados.nome,
            dados.cpf,
            dados.email,
            dados.senha,
            dados.dataNascimento,
            dados.estadoCivil,
            null
        );
    }

    static alterar(dados) {
        return new Usuario(
            dados.nome,
            dados.cpf,
            dados.email,
            dados.senha,
            dados.dataNascimento,
            dados.estadoCivil,
            dados.id
        );
    }
}