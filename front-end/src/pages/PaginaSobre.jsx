import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo_DiaADia.png';
import voAnaImg from '../assets/voana.jpg';
import voBibiaImg from '../assets/vobibia.jpg';
import voFerImg from '../assets/vofer.jpg';
import voDaniImg from '../assets/vodani.png';
import '../components/styles/Sobre.css';

export default function PaginaSobre() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* HEADER / BARRA DE NAVEGAÇÃO FIXA */}
      <header className="landing-header">
        <div className="landing-header-container">
          <div className="landing-brand">
            <img src={logoImg} alt="Dia a Dia Vovôs" className="landing-brand-logo" />
            <span className="landing-brand-title">Dia a Dia Vovôs</span>
          </div>

          <nav className="landing-nav">
            <a href="#proposito">Propósito</a>
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#homenagem">Nossos Avós</a>
            <a href="#equipe">Equipe</a>
          </nav>

          <button className="landing-btn-login" onClick={() => navigate('/login')}>
            Entrar no Painel <i className="bi bi-box-arrow-in-right ms-1"></i>
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-badge">Plataforma Colaborativa de Cuidado</span>
          <h1>Cuidado, carinho e organização no dia a dia da terceira idade.</h1>
          <p>
            Conectamos idosos, familiares e cuidadores em uma rotina unificada com gestão de medicamentos, consultas e saúde com acessibilidade e simplicidade.
          </p>
          <div className="landing-hero-btns">
            <button className="landing-btn-primary" onClick={() => navigate('/login')}>
              Acessar Minha Conta
            </button>
            <button className="landing-btn-secondary" onClick={() => navigate('/cadastro')}>
              Criar Nova Conta
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO SOBRE / PROPÓSITO */}
      <section id="proposito" className="landing-section">
        <div className="landing-section-title">
          <h2>Conectividade e Autonomia no Cuidado</h2>
          <p>Reduzindo a complexidade digital para a terceira idade e facilitando o acompanhamento diário.</p>
        </div>

        <div className="landing-cards-grid">
          <div className="landing-feature-card">
            <div className="landing-card-icon icon-yellow">
              <i className="bi bi-person-heart"></i>
            </div>
            <h3>O Idoso</h3>
            <p>Registra dados diários de bem-estar, visualiza horários de forma acessível e preserva sua independência.</p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-card-icon icon-purple">
              <i className="bi bi-people-fill"></i>
            </div>
            <h3>Cuidadores e Família</h3>
            <p>Acompanham informações em tempo real, recebem alertas automáticos e coordenam decisões em canal compartilhado.</p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-card-icon icon-green">
              <i className="bi bi-hospital"></i>
            </div>
            <h3>Centro Integrado</h3>
            <p>Reúne histórico de saúde, agenda médica, prescrições ativas e contatos de emergência em um só lugar.</p>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE HOMENAGEM AOS AVÓS */}
      <section id="homenagem" className="landing-section landing-section-homenagem">
        <div className="landing-section-title">
          <h2>Nossas Inspirações</h2>
          <p>Este projeto nasce com amor, dedicado à memória e história dos avós dos nossos criadores.</p>
        </div>

        <div className="landing-homenagem-grid">
          <div className="homenagem-card">
            <div className="homenagem-foto-container">
              <img src={voAnaImg} alt="Homenagem à Vovó da Ana" />
            </div>
            <div className="homenagem-info">
              <h3>Incentivo & Amor</h3>
              <p>A sabedoria, o carinho e o sorriso que nos ensinaram a importância de cuidar com afeto em cada etapa da vida.</p>
            </div>
          </div>

          <div className="homenagem-card">
            <div className="homenagem-foto-container">
              <img src={voBibiaImg} alt="Homenagem à Vovó da Beatriz" />
            </div>
            <div className="homenagem-info">
              <h3>União Familiar</h3>
              <p>A presença constante que une gerações e nos lembra do valor imensurável do abraço e da proteção.</p>
            </div>
          </div>

          <div className="homenagem-card">
            <div className="homenagem-foto-container">
              <img src={voFerImg} alt="Homenagem aos Avós da Fernanda" />
            </div>
            <div className="homenagem-info">
              <h3>Gerações Conectadas</h3>
              <p>Histórias vivas que inspiram o desenvolvimento de ferramentas simples para manter todos sempre próximos.</p>
            </div>
          </div>

          <div className="homenagem-card">
            <div className="homenagem-foto-container">
              <img src={voDaniImg} alt="Homenagem aos Avós da Danielly" />
            </div>
            <div className="homenagem-info">
              <h3>Memórias & Sorrisos</h3>
              <p>A alegria nos momentos mais simples no quintal e o legado de carinho que carregamos para sempre no coração.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE FUNCIONALIDADES */}
      <section id="funcionalidades" className="landing-section">
        <div className="landing-section-title">
          <h2>Recursos Principais</h2>
          <p>Tudo o que você precisa para uma rotina de cuidados tranquila e eficiente.</p>
        </div>

        <div className="landing-recursos-list">
          <div className="recurso-linha-item">
            <i className="bi bi-capsule icon-box-purple"></i>
            <div>
              <h4>Gestão de Medicamentos</h4>
              <p>Organização clara de dosagens, horários de administração e frequências.</p>
            </div>
          </div>

          <div className="recurso-linha-item">
            <i className="bi bi-calendar-event icon-box-yellow"></i>
            <div>
              <h4>Agendamento de Consultas</h4>
              <p>Controle de datas, horários e locais com registro de comparência.</p>
            </div>
          </div>

          <div className="recurso-linha-item">
            <i className="bi bi-clipboard2-pulse icon-box-pink"></i>
            <div>
              <h4>Histórico e Doenças</h4>
              <p>Acompanhamento de condições de saúde e registro contínuo.</p>
            </div>
          </div>

          <div className="recurso-linha-item">
            <i className="bi bi-bell icon-box-green"></i>
            <div>
              <h4>Notificações & Alertas</h4>
              <p>Solicitações de vinculação e avisos instantâneos entre cuidador e idoso.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO DA EQUIPE DE DESENVOLVIMENTO */}
      <section id="equipe" className="landing-section landing-section-equipe">
        <div className="landing-section-title">
          <h2>Equipe de Desenvolvimento</h2>
          <p>Projeto desenvolvido por alunos do SENAI "Dr. Celso Charuri" - Sumaré/SP (2026)</p>
        </div>

        <div className="landing-equipe-grid">
          <div className="equipe-card">
            <i className="bi bi-code-slash"></i>
            <h4>Ana Diniz</h4>
            <span>Desenvolvimento Front-end & QA</span>
          </div>

          <div className="equipe-card">
            <i className="bi bi-cpu"></i>
            <h4>Bruno Navarro</h4>
            <span>Desenvolvimento Back-end & Mobile</span>
          </div>

          <div className="equipe-card">
            <i className="bi bi-palette"></i>
            <h4>Beatriz Alves</h4>
            <span>Desenvolvimento Front-end & QA</span>
          </div>

          <div className="equipe-card">
            <i className="bi bi-database"></i>
            <h4>Danielly Figueiredo</h4>
            <span>Banco de Dados & Mobile</span>
          </div>

          <div className="equipe-card">
            <i className="bi bi-window-stack"></i>
            <h4>Fernanda Hirano</h4>
            <span>Desenvolvimento Front-end</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-footer-container">
          <div className="landing-footer-info">
            <img src={logoImg} alt="Dia a Dia Vovôs" />
            <p>© 2026 Dia a Dia Vovôs. Técnico em Desenvolvimento de Sistemas.</p>
          </div>
          <button className="landing-btn-primary" onClick={() => navigate('/login')}>
            Entrar no Sistema
          </button>
        </div>
      </footer>
    </div>
  );
}