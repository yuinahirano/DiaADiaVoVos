import React from "react";

export default function ConsultaCardIdoso({ consulta, formatarData }) {
  if (!consulta) return null;

  const dataFormatada = formatarData ? formatarData(consulta.data) : consulta.data;
  const horarioFormatado = consulta.horario ? consulta.horario.slice(0, 5) : "";

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>{consulta.nome_medico}</h2>

      <div style={styles.cardInfo}>
        {dataFormatada && (
          <p style={styles.cardLabel}>
            Data:{" "}
            <span style={styles.cardValor}>{dataFormatada}</span>
          </p>
        )}

        <p style={styles.cardLabel}>
          Horário:{" "}
          <span style={styles.cardValor}>{horarioFormatado}</span>
        </p>

        <p style={styles.cardLabel}>
          Local:{" "}
          <span style={styles.cardValor}>{consulta.local_consulta}</span>
        </p>

        {consulta.descricao && (
          <p style={styles.cardLabel}>
            Descrição:{" "}
            <span style={styles.cardValor}>{consulta.descricao}</span>
          </p>
        )}
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
    fontSize: "1.3rem",
    fontWeight: "700",
    margin: "0 0 20px 0",
    color: "#000000",
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