import MedicationCard from "./MedicamentosCard";

export default function MedicamentosList({ medicamentos }) {
  return (
    <div style={styles.listGrid}>
      {medicamentos?.map((medicamento) => (
        <MedicationCard key={medicamento.id} medicamento={medicamento}/>
      ))}
    </div>
  );
}

const styles = {
  listGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // Força 2 colunas iguais lado a lado
    gap: '40px', // Espaçamento grande entre os dois cards
    width: '100%'
  }
};