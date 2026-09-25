import DoencaCardIdoso from './DoencaCardIdoso';

export default function DoencasListIdoso({ doencas, onDelete, onEdit }) {
  return (
    <div style={styles.listGrid}>
      {doencas?.map((doenca) => (
        <DoencaCardIdoso
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