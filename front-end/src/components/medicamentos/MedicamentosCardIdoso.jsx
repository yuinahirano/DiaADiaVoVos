import React from "react";

export default function MedicamentoCardIdoso({ medicamento }) {
  if (!medicamento) return null;

  // Trata o horário para exibir apenas hh:mm caso venha em formato hh:mm:ss
  const horarioFormatado = medicamento.horario
    ? medicamento.horario.slice(0, 5)
    : "";

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>{medicamento.nome}</h2>

      <div style={styles.cardInfoDosagem}>
        <div style={styles.borderDosagem}>
          <strong>Dosagem:</strong> {medicamento.dosagem}
        </div>
      </div>

      <div style={styles.cardInfo}>
        <div style={styles.cardField}>
          <strong>Horário:</strong>
          <span style={styles.horarioValue}>{medicamento.horario.slice(0, 5)}</span> {/* slice(0, 5) é para mostrar só hora e minuto. o 0 é onde o corte começa e o 5 é onde termina */}
        </div>
      </div>

      <div style={styles.cardInfo}>
        <div style={styles.cardField}>
          <strong>Frequência:</strong> {medicamento.frequencia}
        </div>
      </div>

      <div style={styles.cardInfo}>
        <div style={styles.cardField}>
          <strong>Observações:</strong> {medicamento.observacoes}
        </div>
      </div>
    </div>
  );
}

// Estilos
const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
  },
  cardTitle: {
    color: '#000000',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '10px 0 10px 10px',
  },
  cardField: {
    fontSize: '18px',
    color: '#000000',
    padding: '0px 10px 10px'
  },
  cardFieldInline: {
    fontSize: '18px',
    color: '#000000',
    display: 'flex',
    alignItems: 'center',
  },
  borderDosagem: {
    fontSize: '18px',
    color: '#000000',
    backgroundColor: '#FFE866',
    padding: '10px',
    borderRadius: '20px'
  },
  buttonContainer: {
    alignSelf: 'flex-end',
    marginTop: 'auto',
    display: 'flex',
    gap: '10px'
  }

};