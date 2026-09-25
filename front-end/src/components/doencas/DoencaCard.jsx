import ButtonEdit from "./ButtonDelete";
import ButtonDelete from "./ButtonEdit";

export default function DoencaCard({ condicao, onDelete, onEdit }) {
  if (!condicao) return null;

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>{condicao.nome}</h2>

      <div style={styles.cardField}>
        <strong>Descrição:</strong>
        <p style={styles.descriptionText}>{condicao.descricao}</p>
      </div>

      <div style={styles.buttonContainer}>
        <ButtonEdit onClick={() => onEdit(condicao)} />
        <ButtonDelete onClick={() => onDelete(condicao.id)} />
      </div>
    </div>
  );
}

// Estilos baseados no design fornecido
const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '28px', // Cantos bastante arredondados como na imagem
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    minHeight: '220px',
  },
  cardTitle: {
    color: '#000000',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
  },
  cardField: {
    fontSize: '18px',
    color: '#000000',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  descriptionText: {
    margin: 0,
    fontSize: '16px',
    color: '#333333',
    lineHeight: '1.4',
  },
  buttonContainer: {
    alignSelf: 'flex-end',
    marginTop: 'auto',
    display: 'flex',
    gap: '10px',
  },
};