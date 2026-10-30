import { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAddMedicamento } from '../../hooks/useAddMed';
import { useIdososDoCuidador } from '../../hooks/useIdososDoCuidador';
import { useIdosoSelecionado } from '../../hooks/useIdosoSelecionado';
import { AuthContext } from '../../contexts/AuthContext';

import '../../components/styles/HomeIdoso.css';
import '../../components/styles/Doencas.css';
import '../../components/styles/Consultas.css';

export default function CadastrarMedicamento() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const { idoso, loading: loadingIdoso } = useIdosoSelecionado();

  const nomeIdoso = loadingIdoso
    ? 'Carregando...'
    : idoso?.nome || 'Idoso';

  const medicamentoEditando = location.state?.medicamento ?? null;
  const isRotaEdicao = location.pathname === '/medicamentos/editar';

  const {
    formData,
    handleChange,
    salvarMedicamento,
    sucesso,
    setSucesso,
    loading,
    erro,
    setErro,
    emEdicao,
  } = useAddMedicamento(medicamentoEditando);

  const {
    idosos = [],
    loading: loadingIdosos,
    erro: erroIdosos,
  } = useIdososDoCuidador();

  useEffect(() => {
    if (
      !emEdicao &&
      idosos.length === 1 &&
      !formData.idIdoso
    ) {
      handleChange({
        target: {
          name: 'idIdoso',
          value: String(idosos[0].id),
        },
      });
    }
  }, [idosos, emEdicao, formData.idIdoso]);

  useEffect(() => {
    if (isRotaEdicao && !medicamentoEditando) {
      navigate('/medicamentos', { replace: true });
    }
  }, [isRotaEdicao, medicamentoEditando, navigate]);

  const voltarParaLista = () => {
    navigate('/medicamentos');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await salvarMedicamento();
  };

  const handleConfirmModal = () => {
    setSucesso(false);
    voltarParaLista();
  };

  const handleSair = async () => {
    if (typeof logout === 'function') {
      await logout();
    }

    navigate('/login', { replace: true });
  };

  const handleErrorModal = () => {
    setErro(null);
  };

  return (
    <div className="home-idoso-container">
      <header className="home-idoso-header">
        <button
          type="button"
          className="home-idoso-icone-btn"
          aria-label="Voltar"
          onClick={voltarParaLista}
          style={styles.backButton}
        >
          <i className="bi bi-chevron-left" />
        </button>

        <h1 className="home-idoso-titulo">{nomeIdoso}</h1>

        <button
          type="button"
          className="home-idoso-link"
          onClick={() => navigate('/doencas')}
        >
          Doenças
        </button>

        <button
          type="button"
          className="home-idoso-link"
          onClick={() => navigate('/consultas')}
        >
          Consultas
        </button>

        <button
          type="button"
          className="home-idoso-btn-ativo"
          onClick={() => navigate('/medicamentos')}
        >
          Medicamentos
        </button>

        <button
          type="button"
          className="home-idoso-link"
          onClick={() => navigate('/registro-saude')}
        >
          Registro Saúde
        </button>

        <button
          type="button"
          className="home-idoso-icone-btn"
          aria-label="Notificações"
          onClick={() => navigate('/home-cuidador')}
          style={styles.notifyButton}
        >
          <i className="bi bi-bell" />
        </button>

        <button
          type="button"
          className="home-idoso-icone-btn"
          aria-label="Sair"
          onClick={handleSair}
        >
          <i className="bi bi-box-arrow-right" />
        </button>
      </header>

      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>
            {emEdicao ? 'Editar Medicamento' : 'Cadastrar Medicamento'}
          </h1>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="idIdoso">
                Idoso:
              </label>

              <select
                id="idIdoso"
                name="idIdoso"
                value={formData.idIdoso}
                onChange={handleChange}
                style={styles.input}
                required
                disabled={loadingIdosos || emEdicao}
              >
                <option value="" disabled>
                  {loadingIdosos
                    ? 'Carregando idosos...'
                    : 'Selecione o idoso'}
                </option>

                {idosos.map((idoso) => (
                  <option key={idoso.id} value={idoso.id}>
                    {idoso.nome}
                  </option>
                ))}
              </select>

              {erroIdosos && (
                <span style={styles.fieldError}>{erroIdosos}</span>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="nome">
                Nome do medicamento:
              </label>

              <input
                id="nome"
                name="nome"
                type="text"
                value={formData.nome}
                onChange={handleChange}
                style={styles.input}
                maxLength={100}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="dosagem">
                Dosagem:
              </label>

              <input
                id="dosagem"
                name="dosagem"
                type="text"
                value={formData.dosagem}
                onChange={handleChange}
                style={styles.input}
                placeholder="Ex.: conforme prescrição"
                maxLength={50}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="horario">
                Horário:
              </label>

              <input
                id="horario"
                name="horario"
                type="time"
                value={formData.horario}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="tipoFrequencia">
                Tipo de frequência:
              </label>

              <select
                id="tipoFrequencia"
                name="tipoFrequencia"
                value={formData.tipoFrequencia}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="vezes_por_dia">
                  Vezes por dia
                </option>

                <option value="intervalo_horas">
                  Intervalo em horas
                </option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="valorFrequencia">
                {formData.tipoFrequencia === 'vezes_por_dia'
                  ? 'Quantas vezes por dia?'
                  : 'Intervalo em horas:'}
              </label>

              <input
                id="valorFrequencia"
                name="valorFrequencia"
                type="number"
                min="1"
                max={
                  formData.tipoFrequencia === 'vezes_por_dia'
                    ? '24'
                    : '168'
                }
                step="1"
                value={formData.valorFrequencia}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            {emEdicao && (
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="status">
                  Status:
                </label>

                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="ativo">Ativo</option>
                  <option value="pausado">Pausado</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="observacoes">
                Observações:
              </label>

              <textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                style={styles.textarea}
                rows="3"
                maxLength={100}
              />
            </div>

            <div style={styles.buttonRow}>
              <button
                type="button"
                onClick={voltarParaLista}
                style={styles.cancelButton}
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                type="submit"
                style={styles.submitButton}
                disabled={loading || loadingIdosos}
              >
                {loading
                  ? 'Salvando...'
                  : emEdicao
                    ? 'Salvar alterações'
                    : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {sucesso && (
        <div style={styles.innerModalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Sucesso!</h2>

            <p style={styles.modalText}>
              {emEdicao
                ? 'O medicamento foi atualizado com sucesso.'
                : 'O medicamento foi cadastrado com sucesso.'}
            </p>

            <button
              type="button"
              onClick={handleConfirmModal}
              style={styles.modalButton}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {erro && (
        <div style={styles.innerModalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Erro</h2>

            <p style={styles.modalText}>{erro}</p>

            <button
              type="button"
              onClick={handleErrorModal}
              style={styles.modalButton}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  backButton: {
    backgroundColor: '#FFE866',
    color: '#000000',
  },

  notifyButton: {
    backgroundColor: '#FFE866',
    color: '#000000',
  },

  page: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    padding: '30px 16px',
    boxSizing: 'border-box',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '28px',
    padding: '30px 40px',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    boxSizing: 'border-box',
  },

  title: {
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: '20px',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  label: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#000000',
  },

  input: {
    backgroundColor: '#E4ECF2',
    border: '1.5px solid #000000',
    borderRadius: '12px',
    minHeight: '40px',
    padding: '8px 14px',
    fontSize: '15px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },

  textarea: {
    backgroundColor: '#E4ECF2',
    border: '1.5px solid #000000',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '15px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    resize: 'vertical',
  },

  fieldError: {
    color: '#B00020',
    fontSize: '13px',
  },

  buttonRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginTop: '15px',
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#E1E8EC',
    color: '#000000',
    border: 'none',
    borderRadius: '18px',
    minHeight: '44px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },

  submitButton: {
    flex: 1,
    backgroundColor: '#FFE866',
    color: '#000000',
    border: 'none',
    borderRadius: '18px',
    minHeight: '44px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },

  innerModalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
    padding: '16px',
  },

  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '30px',
    width: '90%',
    maxWidth: '380px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  },

  modalTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: '12px',
    color: '#000000',
  },

  modalText: {
    fontSize: '15px',
    color: '#444444',
    marginBottom: '24px',
  },

  modalButton: {
    backgroundColor: '#FFE866',
    color: '#000000',
    border: 'none',
    borderRadius: '16px',
    padding: '12px 36px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};