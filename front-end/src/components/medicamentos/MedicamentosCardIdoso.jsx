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

      <div style={styles.cardInfo}>
        <p style={styles.cardLabel}>
          Dosagem:{" "}
          <span style={styles.cardValor}>{medicamento.dosagem}</span>
        </p>

        <p style={styles.cardLabel}>
          Horário:{" "}
          <span style={styles.cardValor}>{horarioFormatado}</span>
        </p>

        <p style={styles.cardLabel}>
          Frequência:{" "}
          <span style={styles.cardValor}>{medicamento.frequencia}</span>
        </p>

        <p style={styles.cardLabel}>
          Observações:{" "}
          <span style={styles.cardValor}>{medicamento.observacoes}</span>
        </p>
      </div>
    </div>
  );
}

// Estilos
const styles = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    width: "300px",
    minHeight: "220px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
    display: "flex",
    flexDirection: "column",
  },
  cardTitle: {
    color: '#000000',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
  },
  cardInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "auto",
  },
  cardLabel: {
    fontWeight: "700",
    margin: 0,
    fontSize: "1rem",
    color: "#000000",
  },
  cardValor: {
    fontWeight: "400",
  },
};