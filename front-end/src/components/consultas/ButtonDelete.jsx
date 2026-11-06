export default function ButtonDelete({ onClick }) {
  return (
    <button
      type="button"
      style={styles.btnDelete}
      onClick={onClick}
      aria-label="Excluir"
    >
      <i className="bi bi-trash-fill"></i>
      <span>Excluir</span>
    </button>
  );
}

const styles = {
  btnDelete: {
    backgroundColor: "#FFE5E5",
    color: "#DC3545",
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