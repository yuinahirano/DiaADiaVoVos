import ButtonDelete from "./BotaoDeletar";
import ButtonEdit from "./BotaoEditar";

export default function MedicationCard({ medicamento, onDelete, onEdit }) {
  if (!medicamento) return null;

  // slice(0, 5): mostra só hh:mm quando o horário vem como hh:mm:ss
  const horario = medicamento.horario ? medicamento.horario.slice(0, 5) : "";

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>{medicamento.nome?.toUpperCase()}</h2>

      <div style={styles.borderDosagem}>
        <strong>Dosagem:</strong> {medicamento.dosagem}
      </div>

      <div style={styles.cardField}>
        <strong>Horário:</strong> {horario}
      </div>

      <div style={styles.cardField}>
        <strong>Frequência:</strong> {medicamento.frequencia}
      </div>

      <div style={styles.cardField}>
        <strong>Observações:</strong> {medicamento.observacoes}
      </div>

      <div style={styles.buttonContainer}>
        <ButtonEdit onClick={() => onEdit(medicamento)} />
        <ButtonDelete onClick={() => onDelete(medicamento.id)} />
      </div>
    </div>
  );
}

// Mesmas medidas dos cards de Doenças e Consultas (raio 24, padding 24, gap 16)
const styles = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    minHeight: "220px",
  },
  cardTitle: {
    color: "#000000",
    fontSize: "28px",
    fontWeight: "bold",
    margin: 0,
  },
  cardField: {
    fontSize: "18px",
    color: "#000000",
  },
  borderDosagem: {
    fontSize: "18px",
    color: "#000000",
    backgroundColor: "#FFE866",
    padding: "10px",
    borderRadius: "20px",
  },
  buttonContainer: {
    alignSelf: "flex-end",
    marginTop: "auto",
    display: "flex",
    gap: "10px",
  },
};
