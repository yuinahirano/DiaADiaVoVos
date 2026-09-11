export default function ButtonEdit({ onClick }) {
  return (
    <button style={styles.button} onClick={onClick} aria-label="Editar">
      <i className="bi bi-pencil-fill" style={styles.icone}></i>
    </button>
  );
}

//estilização
const styles = {
  button: {
    backgroundColor: '#E4ECF2',
    border: 'none',
    borderRadius: '50%',
    width: '64px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    outline: 'none',
    padding: 0,
    boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
  },

  icone: {
    fontSize: '24px',
    color: '#000000'
  }
};