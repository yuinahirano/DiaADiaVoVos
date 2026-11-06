import MedicationCard from "./MedicamentosCard";
import "../styles/CuidadorLayout.css";

export default function MedicamentosList({ medicamentos, onDelete, onEdit }) {
  if (!medicamentos || medicamentos.length === 0) return null;

  return (
    <div className="cuidador-grid">
      {medicamentos.map((medicamento) => (
        <MedicationCard
          key={medicamento.id}
          medicamento={medicamento}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}