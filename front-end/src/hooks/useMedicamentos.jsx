import { useEffect, useState } from "react";
import { getMedicamentos } from "../service/medicamentoApi";

export function useMedicamentos() {
    const [medicamentos, setMedicamentos] = useState([]); //array de objetos
    const [loading, setLoading] = useState(true);

    useEffect(() => { 

        async function loadMedicamentos() {
            try {
                const data = await getMedicamentos();
                
                setMedicamentos(data.result);
                console.log(data.result);

            } catch (error) {
                console.log("Erro ao buscar medicamentos", error);

            } finally{

                setLoading(false);
            }
        }

        loadMedicamentos();
        
    }, []);

    return { medicamentos, loading };
}