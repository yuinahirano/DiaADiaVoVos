import { useState, useEffect } from "react";
import MedicamentosList from "../components/medicamentos/MedicamentosList";
import { useMedicamentos } from '../hooks/useMedicamentos';
import CadastrarMedicamento from "./PaginaAddMedicamento";

export default function MedicationPage() {
  const { medicamentos, loading } = useMedicamentos(); //para carregar os medicamentos
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={styles.container}>
      {/* header com o nome do idoso e o botão de voltar*/}
      <header style={styles.header}>
        <div style={styles.titleSection}>
          <span style={styles.backButton}>&lt;</span>
          <h1 style={styles.title}>Idoso 1</h1>
        </div>

        {/* barra de navegação */}
        <nav style={styles.nav}>
          <button style={styles.inactiveNav}>Doenças</button>
          <button style={styles.inactiveNav}>Consultas</button>
          <button style={styles.activeTab}>Medicamentos</button>
          <button style={styles.inactiveNav}>Registro Saúde</button>
        </nav>
      </header>

      {/* botão de adicionar medicamento */}
      <div style={styles.actionRow}>
        <button style={styles.addButton} onClick={() => setIsModalOpen(true)}> {/*ativa o modal */}
          <span style={styles.addIcon}>+</span> {/* span para estilizar de forma separada do texto do botão */}
          Adicionar medicamento
        </button>
      </div>

      {/*chama os cards*/}
      <main style={styles.grid}>
        {loading ? (
          <p style={styles.loadingText}>Carregando medicamentos...</p> //mensagem enquanto carrega informações
        ) : (
          <MedicamentosList medicamentos={medicamentos} />
        )}
      </main>

      {/* o modal é rendenrizado quando isModalOpen é true */}
      <CadastrarMedicamento
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
}

// Estilos do layout da Tela
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
    padding: '10px 30px',
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
  backButton: {
    backgroundColor: '#FFE866',
    color: '#FFFFFF',
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: 0
  },
  nav: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },
  activeTab: {
    backgroundColor: '#FFE866',
    border: 'none',
    borderRadius: '25px',
    padding: '8px 25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    outline: 'none'
  },
  inactiveNav: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#000000',
    outline: 'none'
  },

  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '25px'
  },

  addButton: {
    backgroundColor: '#FFE866',
    color: '#000000',
    border: 'none',
    borderRadius: '25px',
    padding: '10px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    outline: 'none'
  },
  addIcon: {
    fontSize: '20px',
    fontWeight: 'bold',
    lineHeight: '1'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '50px'
  },
  loadingText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333'
  }
};