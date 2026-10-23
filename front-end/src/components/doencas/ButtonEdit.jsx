export default function ButtonEdit({ onClick }) {
  return (
    <button
      style={styles.btnEdit}
      onClick={onClick}
      aria-label="Editar"
    >
      <i className="bi bi-pencil-fill"></i>
      <span>Editar</span>
    </button>
  );
}

const styles = {
  btnEdit: {
    backgroundColor: "#E3F2FD",
    color: "#0D6EFD",
    border: "none",
    borderRadius: "14px",
    flex: 1,
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    transition: "background-color 0.2s",
  },
};