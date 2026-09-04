import { useEffect, useState } from "react";
import { login } from "../service/userApi";

export function useUsers() {

    //guarda credenciais do usuário
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    //guarda o token que vai ser gerado
    const [jwt, setJwt] = useState(null);
    //gatilho para a requisição do login
    const [efetuarLogin, setEfetuarLogin] = useState(false);

    useEffect(() => {

        //se efeturarLogin continuar falso, retorna nada
        if(!efetuarLogin) return;

        //quando o usuário efetuar a ação de clicar o botão, efetuarLogin vira verdadeiro, e então o useEffect percebe essa mudança
        async function loginUser() {

            //função que faz a requisição para a API
            try {
                const data = await login(email, senha);
                setJwt(data);
                console.log("Login efetuado com sucesso!")

            } catch (error) {
                console.log("Erro ao buscar as pessoas", error);
            } finally{
                //depois da requisição, o efetuarLogin volta como falso
                setEfetuarLogin(false);
            }
        }
        loginUser();
    }, [efetuarLogin, email, senha])

    return {
        email,
        setEmail,
        senha,
        setSenha,
        jwt,
        setEfetuarLogin
    };

}