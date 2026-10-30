
import MedicationCard from "./MedicamentosCard";

export default function MedicamentosList({
  medicamentos,
  onDelete,
  onEdit,
}) {
  return (
    <div style={styles.listGrid}>
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

const styles = {
  listGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "15px",
    width: "100%",
  },
};
