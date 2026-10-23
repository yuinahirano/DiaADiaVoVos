import ButtonDelete from "./BotaoDeletar";
import ButtonEdit from "./BotaoEditar";

export default function MedicationCard({ medicamento, onDelete, onEdit }) {
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
      : medicamento.tipoFrequencia;

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>{medicamento.nome?.toUpperCase()}</h2>

      <div style={styles.borderDosagem}>
        <strong>Dosagem:</strong> {medicamento.dosagem}
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
          <span>
            {medicamento.intervaloMinutos != null
              ? `${medicamento.intervaloMinutos} minutos (${medicamento.intervaloMinutos / 60} ${
                  medicamento.intervaloMinutos / 60 === 1 ? "hora" : "horas"
                })`
              : "Não informado"}
          </span>
        </div>

        <div style={styles.extraCard}>
          <strong>Status</strong>
          <span>{medicamento.status.toUpperCase() || "Não informado"}</span>
        </div>

        {medicamento.observacoes && (
          <div style={styles.observacoesCard}>
            <strong>Observações</strong>
            <span>{medicamento.observacoes}</span>
          </div>
        )}
      </div>

      <div style={styles.buttonContainer}>
        <ButtonEdit onClick={() => onEdit(medicamento)} />
        <ButtonDelete onClick={() => onDelete(medicamento.id)} />
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

  borderDosagem: {
    fontSize: "18px",
    color: "#000000",
    backgroundColor: "#FFE866",
    padding: "14px",
    borderRadius: "18px",
    textAlign: "center",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    width: "100%",
  },

  infoCard: {
    backgroundColor: "#FFF4B8",
    borderRadius: "18px",
    padding: "16px 8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: "10px",
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
    backgroundColor: "#FFF4B8",
    borderRadius: "16px",
    padding: "14px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "6px",
    fontSize: "15px",
    color: "#000000",
    boxSizing: "border-box",
    overflowWrap: "anywhere",
  },

  observacoesCard: {
    gridColumn: "1 / -1",
    backgroundColor: "#FFF4B8",
    borderRadius: "16px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "6px",
    fontSize: "15px",
    lineHeight: "1.5",
    color: "#000000",
    overflowWrap: "anywhere",
  },

  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "10px",
    marginTop: "2px",
  },
};
