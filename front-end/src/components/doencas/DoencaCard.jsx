import ButtonDelete from "./ButtonDelete";
import ButtonEdit from "./ButtonEdit";

export default function DoencaCard({ condicao, onDelete, onEdit }) {
  if (!condicao) return null;

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>{condicao.nome?.toUpperCase()}</h2>

      <div style={styles.descricaoCard}>
        <strong>Descrição</strong>
        <span>{condicao.descricao || "Não informado"}</span>
      </div>

      <div style={styles.buttonContainer}>
        <ButtonEdit onClick={() => onEdit(condicao)} />
        <ButtonDelete onClick={() => onDelete(condicao.id)} />
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

  descricaoCard: {
    backgroundColor: "#FFF4B8",
    borderRadius: "18px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "8px",
    fontSize: "16px",
    color: "#000000",
    boxSizing: "border-box",
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