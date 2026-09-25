import DoencaCard from "./DoencaCard";

export default function DoencasList({ doencas, onDelete, onEdit }) {
  return (
    <div style={styles.listGrid}>
      {doencas?.map((doenca) => (
        <DoencaCard
          key={doenca.id}
          condicao={doenca}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

const styles = {
  listGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr', // Força 2 colunas iguais lado a lado
    gap: '15px', // Espaçamento grande entre os dois cards
    width: '100%'
  }
};