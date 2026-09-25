import imagemLixeira from '../../assets/lixeira.png';

export default function ButtonDelete({ onClick }) {
  return (
    <button style={styles.btnDelete} onClick={onClick} aria-label="Excluir">
        <i className="bi bi-trash-fill"></i>
    </button>
  );
}

//estilização
const styles = {
  btnDelete: {
    backgroundColor: "#ffe5e5",
    color: "#dc3545",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.2s",
  },
};