import { useEffect, useState } from "react";
import { deleteMedicamentos, getMedicamentos } from "../service/medicamentoApi";

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

    //remover medicamento pelo id
    async function deletarMedicamento(id) {
        try {
            //chama metodo da api
            if (deleteMedicamentos) {
                await deleteMedicamentos(id);
            }

            // Atualiza o estado removendo o item instantaneamente da tela
            setMedicamentos((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            console.log("Erro ao deletar medicamento:", error);
        }
    }

    return { medicamentos, loading, deletarMedicamento };
}