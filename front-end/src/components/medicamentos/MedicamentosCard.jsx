export default function MedicationCard({ medicamento }) {
 

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>{medicamento.nome}</h2>

      <div style={styles.cardField}>
        <strong>Dosagem:</strong> {medicamento.dosagem}
      </div>

      <div style={styles.cardField}>
        <strong>Horário:</strong>
        <span style={styles.horarioValue}>{medicamento.horario}</span>
      </div>

      <div style={styles.cardField}>
        <strong>Frequência:</strong> {medicamento.frequencia}
      </div>

      <div style={styles.cardField}>
        <strong>Observações:</strong> {medicamento.observacoes}
      </div>
    </div>
  );
}

// Estilos
const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
  },
  cardTitle: {
    color: '#000000',
    fontSize: '30px',
    fontWeight: 'bold',
    margin: '0 0 10px 0'
  },
  cardField: {
    fontSize: '18px',
    color: '#000000'
  },
  cardFieldInline: {
    fontSize: '18px',
    color: '#000000',
    display: 'flex',
    alignItems: 'center'
  }
};