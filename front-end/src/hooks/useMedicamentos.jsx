import { useEffect, useState } from "react";
import { deleteMedicamentos, getMedicamentos } from "../service/medicamentoApi";

export function useMedicamentos() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMedicamentos() {
      try {
        const data = await getMedicamentos();
        setMedicamentos(data.result);
      } catch (error) {
        console.log("Erro ao buscar medicamentos", error);
      } finally {
        setLoading(false);
      }
    }

    loadMedicamentos();
  }, []);

  async function deletarMedicamento(id) {
    try {
      await deleteMedicamentos(id);
      setMedicamentos((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.log("Erro ao deletar medicamento:", error);
    }
  }

  return { medicamentos, loading, deletarMedicamento };
}