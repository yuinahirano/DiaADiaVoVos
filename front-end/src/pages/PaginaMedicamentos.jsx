import { useState,useEffect } from "react";
import MedicamentosList from "../components/medicamentos/MedicamentosList";
import {useMedicamentos} from '../hooks/useMedicamentos';

export default function MedicationPage() {
  const {medicamentos, loading} = useMedicamentos(); //para carregar os medicamentos

  return (
    <div style={styles.container}>
      {/* Header estático mantendo o design da imagem */}
      <header style={styles.header}>
        <div style={styles.titleSection}>
          <span style={styles.backButton}>&lt;</span>
          <h1 style={styles.title}>Idoso 1</h1>
        </div>

        <nav style={styles.nav}>
          <span style={styles.inactiveNav}>Doenças</span>
          <span style={styles.inactiveNav}>Consultas</span>
          <span style={styles.activeTab}>Medicamentos</span>
          <span style={styles.inactiveNav}>Registro Saúde</span>
        </nav>
      </header>

      {/*chama os cards*/}
      <main style={styles.grid}>
        {loading ? (
          <p style={styles.loadingText}>Carregando medicamentos...</p> //mensagem enquanto carrega informações
        ) : (
          <MedicamentosList medicamentos={medicamentos}/>
        )}
      </main>
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
    borderRadius: '25px',
    padding: '8px 20px',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  inactiveNav: {
    fontSize: '16px',
    fontWeight: 'bold'
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