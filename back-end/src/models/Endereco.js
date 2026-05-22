export class Endereco {
    #id
    #idUsuario
    #logradouro
    #numero
    #complemento
    #bairro
    #cidade
    #uf
    #cep

    constructor(logradouro, numero, complemento, bairro, cidade, uf, cep, id, idUsuario) {
        this.id = id;
        this.idUsuario = idUsuario;
        this.logradouro = logradouro;
        this.numero = numero;
        this.complemento = complemento;
        this.bairro = bairro;
        this.cidade = cidade;
        this.uf = uf;
        this.cep = cep;
    }

    // GETTERS E SETTERS
    get id() {
        return this.#id;
    }
    set id(value) {
        this.#validarId(value);
        this.#id = value;
    }

    get idUsuario() {
        return this.#idUsuario;
    }
    set idUsuario(value) {
        this.#validarIdUsuario(value);
        this.#idUsuario = value;
    }

    get logradouro() {
        return this.#logradouro;
    }
    set logradouro(value) {
        this.#validarTexto(value, 'logradouro');
        this.#logradouro = value;
    }

    get numero() {
        return this.#numero;
    }
    set numero(value) {
        this.#validarTexto(value, 'número');
        this.#numero = value;
    }

    get complemento() {
        return this.#complemento;
    }
    set complemento(value) {
        this.#complemento = value || null;
    }

    get bairro() {
        return this.#bairro;
    }
    set bairro(value) {
        this.#validarTexto(value, 'bairro');
        this.#bairro = value;
    }

    get cidade() {
        return this.#cidade;
    }
    set cidade(value) {
        this.#validarTexto(value, 'cidade');
        this.#cidade = value;
    }

    get uf() {
        return this.#uf;
    }
    set uf(value) {
        if (!value || value.length !== 2) {
            throw new Error('uf deve conter 2 caracteres');
        }
        this.#uf = value.toUpperCase();
    }

    get cep() {
        return this.#cep;
    }
    set cep(value) {
        if (!value || value.trim().length !== 8) {
            throw new Error('CEP deve conter exatamente 8 caracteres');
        }
        this.#cep = value;
    }


    #validarId(value) {
        if (value != null && value <= 0) {
            throw new Error('ID inválido');
        }
    }

    #validarIdUsuario(value) {        
        if (value && value <= 0) {
            throw new Error('ID do usuario é obrigatório');
        }
    }

    #validarTexto(value, campo) {
        if (!value || value.trim().length < 2) {
            throw new Error(`o campo ${campo} é obrigatório`);
        }
    }


    static criar(dados) {
        console.log('gfdg: ',dados);
        
        return new Endereco(dados.logradouro, dados.numero, dados.complemento, dados.bairro, dados.cidade, dados.uf, dados.cep, null, null
        );
    }

    static alterar(dados, id) {
        return new Endereco(dados.logradouro, dados.numero, dados.complemento, dados.bairro, dados.cidade, dados.uf, dados.cep,id, dados.idUsuario
        );
    }
}