import MedicationCard from "./MedicamentosCard";

export default function MedicamentosList({ medicamentos, onDelete, onEdit }) {
  return (
    <div className="lista-grid">
      {medicamentos?.map((medicamento) => (
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