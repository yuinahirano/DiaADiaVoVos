import { api_diadiavovos } from "./api";

export async function getMedicamentos() {
    try {
        
        const resposta = await api_diadiavovos.get(`/medicamento`);
        return resposta.data;

    } catch (erro) {
        console.error('Erro ao buscar medicamentos:', erro);
        throw erro; // Lança o erro para o componente poder tratar (ex: exibir mensagem)
    }
}

export async function addMedicamento(dadosMedicamento) {
    try {
        
        const resposta = await api_diadiavovos.post(`/medicamento`, dadosMedicamento);
        return resposta.data;

    } catch (erro) {
        console.error('Erro ao buscar medicamentos:', erro);
        throw erro; // Lança o erro para o componente poder tratar (ex: exibir mensagem)
    }
}

export async function deleteMedicamentos(id){
    try {
        
        const resposta = await api_diadiavovos.delete(`/medicamento/${id}`);
        return resposta.data;

    } catch (erro) {
        console.error('Erro ao buscar medicamentos:', erro);
        throw erro; // Lança o erro para o componente poder tratar (ex: exibir mensagem)
    }
}