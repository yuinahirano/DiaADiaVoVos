import imagemLixeira from '../../assets/lixeira.png';

export default function ButtonDelete({ onClick }) {
  return (
    <button style={styles.button} onClick={onClick} aria-label="Excluir">
        <img src={imagemLixeira}
        style={styles.imagemLixeira}/>
    </button>
  );
}

//estilização
const styles = {
  button: {
    backgroundColor: '#FFE866',
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

  imagemLixeira: {
    width: '80px',
    height: '50px',
  }
};