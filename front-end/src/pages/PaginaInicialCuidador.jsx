export default function PaginaInicialCuidador() {

  // Dados mockados só para visualização - substituir depois pela integração com a API
  const idosos = [
    { id: 1, nome: "Idoso 1" },
    { id: 2, nome: "Idoso 2" },
    { id: 3, nome: "Idoso 3" },
    { id: 4, nome: "Idoso 4" },
  ];

  return (
    <div style={styles.container}>
      {/* Header estático mantendo o design da imagem */}
      <header style={styles.header}>
        <div style={styles.titleSection}>
          <span style={styles.avatar}>👤</span>
          <h1 style={styles.title}>Olá [Nome Cuidador]</h1>
        </div>

        <div style={styles.actions}>
          <button style={styles.addButton}>+ Adicionar idoso</button>
          <span style={styles.settingsIcon}>⚙️</span>
        </div>
      </header>

      {/* Cards dos idosos */}
      <main style={styles.grid}>
        {idosos.map((idoso) => (
          <div key={idoso.id} style={styles.card}>
            <h2 style={styles.cardTitle}>{idoso.nome}</h2>
          </div>
        ))}
      </main>
    </div>
  );
}


const styles = {
  container: {
    backgroundColor: '#EBF3FF',
    minHeight: '100vh',
    padding: '40px 60px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: '50px',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px'
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  avatar: {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  addButton: {
    backgroundColor: '#FFE866',
    border: 'none',
    borderRadius: '25px',
    padding: '10px 25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    outline: 'none'
  },
  settingsIcon: {
    fontSize: '22px',
    cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '50px'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    padding: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    margin: 0
  }
};