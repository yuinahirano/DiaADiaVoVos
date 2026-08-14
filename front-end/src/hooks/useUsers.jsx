import { useEffect, useState } from "react";
import { login } from "../service/userApi";

export function useUsers() {

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [jwt, setJwt] = useState(null);
    const [efetuarLogin, setEfetuarLogin] = useState(false);

    useEffect(() => {

        if(!efetuarLogin) return;

        async function loginUser() {

            try {
                const data = await login(email, senha);
                setJwt(data);
                console.log("Login efetuado com sucesso!", data)

            } catch (error) {
                console.log("Erro ao buscar as pessoas", error);
            } finally{
                setEfetuarLogin(false);
            }
        }
        loginUser();
    }, [efetuarLogin])

    return {
        email,
        setEmail,
        senha,
        setSenha,
        jwt
    };

}