import React from "react";

export default function MedicamentoCardIdoso({ medicamento }) {
  if (!medicamento) return null;

  const formatarHorario = (horario) =>
    horario ? horario.slice(0, 5) : "Não informado";

  const frequencia =
    medicamento.tipoFrequencia === "vezes_por_dia"
      ? `${medicamento.valorFrequencia} ${
          Number(medicamento.valorFrequencia) === 1
            ? "vez por dia"
            : "vezes por dia"
        }`
      : medicamento.tipoFrequencia || medicamento.frequencia || "Não informado";

  const intervalo =
    medicamento.intervaloMinutos ?? medicamento.tempoMinuto;

  const formatarIntervalo = (minutos) => {
    if (minutos == null || minutos === "") return "Não informado";

    const valor = Number(minutos);
    const horas = valor / 60;

    return `${valor} minutos (${horas} ${horas === 1 ? "hora" : "horas"})`;
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>
        {medicamento.nome?.toUpperCase()}
      </h2>

      <div style={styles.dosagemCard}>
        <strong>Dosagem:</strong>
        <span>{medicamento.dosagem || "Não informado"}</span>
      </div>

      <div style={styles.infoGrid}>
        <div style={styles.infoCard}>
          <strong>Horário atual</strong>
          <span>{formatarHorario(medicamento.horario)}</span>
        </div>

        <div style={styles.infoCard}>
          <strong>Próximo horário</strong>
          <span>{formatarHorario(medicamento.proximoHorario)}</span>
        </div>

        <div style={styles.infoCard}>
          <strong>Última dose</strong>
          <span>{formatarHorario(medicamento.ultimaDose)}</span>
        </div>

        <div style={styles.infoCard}>
          <strong>Frequência</strong>
          <span>{frequencia}</span>
        </div>
      </div>

      <div style={styles.extraGrid}>
        <div style={styles.extraCard}>
          <strong>Intervalo</strong>
          <span>{formatarIntervalo(intervalo)}</span>
        </div>

        <div style={styles.extraCard}>
          <strong>Status</strong>
          <span>{medicamento.status.toUpperCase() || "Não informado"}</span>
        </div>

        <div style={styles.observacoesCard}>
          <strong>Observações</strong>
          <span>{medicamento.observacoes || "Nenhuma observação"}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "28px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    width: "100%",
    boxSizing: "border-box",
  },

  cardTitle: {
    color: "#000000",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
    margin: "0 0 4px 0",
    overflowWrap: "anywhere",
  },

  dosagemCard: {
    backgroundColor: "#C9AEE6",
    color: "#000000",
    padding: "14px",
    borderRadius: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    fontSize: "18px",
    textAlign: "center",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    width: "100%",
  },

  infoCard: {
    backgroundColor: "#F0E6FA",
    borderRadius: "18px",
    padding: "16px 8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    textAlign: "center",
    fontSize: "16px",
    color: "#000000",
    minHeight: "76px",
    boxSizing: "border-box",
    overflowWrap: "anywhere",
  },

  extraGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    width: "100%",
  },

  extraCard: {
    backgroundColor: "#F0E6FA",
    borderRadius: "18px",
    padding: "14px 8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    textAlign: "center",
    fontSize: "15px",
    color: "#000000",
    minWidth: 0,
    overflowWrap: "anywhere",
  },

  observacoesCard: {
    gridColumn: "1 / -1",
    backgroundColor: "#F7F1FC",
    borderRadius: "18px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    textAlign: "center",
    fontSize: "15px",
    lineHeight: "1.5",
    color: "#000000",
    overflowWrap: "anywhere",
  },
};