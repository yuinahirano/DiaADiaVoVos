import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAddConsulta } from '../../hooks/useAddConsulta';
import { useIdososDoCuidador } from '../../hooks/useIdososDoCuidador';
import { useIdosoSelecionado } from '../../hooks/useIdosoSelecionado';

//estilizações (as mesmas da página de consultas, para manter o fundo)
import '../../components/styles/HomeIdoso.css';
import '../../components/styles/Doencas.css';
import '../../components/styles/Consultas.css';

export default function CadastrarConsulta() {
    const navigate = useNavigate();
    const location = useLocation();

    // Nome do idoso para o cabeçalho
    const { idoso, loading: loadingIdoso } = useIdosoSelecionado();
    const nomeIdoso = loadingIdoso ? 'Carregando...' : idoso?.nome || 'Idoso';

    // Na edição, a consulta chega pelo state da navegação
    const consultaEditando = location.state?.consulta ?? null;
    const isRotaEdicao = location.pathname === '/consultas/editar';

    const {
        formData,
        handleChange,
        setEfetuarCadastro,
        sucesso,
        setSucesso,
        loading,
        erro,
        setErro,
        emEdicao
    } = useAddConsulta(consultaEditando);

    const {
        idosos,
        loading: loadingIdosos,
        erro: erroIdosos
    } = useIdososDoCuidador();

    // Se der F5 na tela de edição, o state se perde: volta para a lista
    useEffect(() => {
        if (isRotaEdicao && !consultaEditando) {
            navigate('/consultas', { replace: true });
        }
    }, [isRotaEdicao, consultaEditando, navigate]);

    const voltarParaLista = () => navigate('/consultas');

    const handleSubmit = (e) => {
        e.preventDefault();
        setEfetuarCadastro(true);
    };

    const handleConfirmModal = () => {
        setSucesso(false);
        voltarParaLista();
    };

    const handleErrorModal = () => {
        setErro(null);
    };

    return (
        <div className="consultas-container">
            <header className="home-idoso-header">
              {/* botão de voltar */}
              <button
                className="home-idoso-icone-btn"
                aria-label="Voltar"
                onClick={() => navigate(-1)}
                style={styles.backButton}
              >
                <i className="bi bi-chevron-left"></i>
              </button>

              {/* saudacao */}
              <h1 className="home-idoso-titulo">{nomeIdoso}</h1>

              {/* barra de navegação e seus botões */}
              <button
                className="home-idoso-link"
                onClick={() => navigate("/doencas")}
              >
                Doenças
              </button>

              {/* botão de consultas */}
              <button
                className="home-idoso-btn-ativo"
                onClick={() => navigate("/consultas")}
              >
                Consulta
              </button>

              {/* botão de medicamentos */}
              <button
                className="home-idoso-link"
                onClick={() => navigate("/medicamentos")}
              >
                Medicamentos
              </button>

              {/* botão de registro de saúde */}
              <button
                className="home-idoso-link"
                onClick={() => navigate("/registro-saude")}
              >
                Registro Saúde
              </button>

              {/* botão de notificação */}
              <button
                className="home-idoso-icone-btn"
                aria-label="Notificações"
                onClick={() => navigate("/notificacoes-idoso")}
                style={styles.notifyButton}
              >
                <i className="bi bi-bell"></i>
              </button>

              {/* botão de sair */}
              <button
                className="home-idoso-icone-btn"
                aria-label="Sair"
                onClick={() => navigate("/sair")}
              >
                <i className="bi bi-box-arrow-right"></i>
              </button>
            </header>

            <div style={styles.page}>
            <div style={styles.card}>

                <h1 style={styles.title}>
                    {emEdicao ? 'Editar Consulta' : 'Cadastrar Consulta'}
                </h1>

                <form onSubmit={handleSubmit} style={styles.form}>

                    {/* IDOSO */}
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
                            <span style={styles.fieldError}>
                                {erroIdosos}
                            </span>
                        )}
                    </div>

                    {/* MÉDICO */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label} htmlFor="nomeMedico">
                            Médico:
                        </label>

                        <input
                            id="nomeMedico"
                            name="nomeMedico"
                            type="text"
                            value={formData.nomeMedico}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    {/* LOCAL */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label} htmlFor="localConsulta">
                            Local:
                        </label>

                        <input
                            id="localConsulta"
                            name="localConsulta"
                            type="text"
                            value={formData.localConsulta}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    {/* DATA */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label} htmlFor="data">
                            Data:
                        </label>

                        <input
                            id="data"
                            name="data"
                            type="date"
                            value={formData.data ? String(formData.data).slice(0, 10) : ''}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    {/* HORÁRIO */}
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

                    {/* OBSERVAÇÕES */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label} htmlFor="descricao">
                            Observações:
                        </label>

                        <input
                            id="descricao"
                            name="descricao"
                            type="text"
                            value={formData.descricao}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>

                    {/* BOTÕES */}
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
                            disabled={loading}
                        >
                            {loading
                                ? 'Salvando...'
                                : (
                                    emEdicao
                                        ? 'Salvar alterações'
                                        : 'Cadastrar'
                                )}
                        </button>
                    </div>

                </form>
            </div>
            </div>

            {/* POPUP DE SUCESSO */}
            {sucesso && (
                <div style={styles.innerModalOverlay}>
                    <div style={styles.modalContent}>
                        <h2 style={styles.modalTitle}>Sucesso!</h2>

                        <p style={styles.modalText}>
                            {emEdicao
                                ? 'A consulta foi atualizada com sucesso.'
                                : 'A consulta foi salva com sucesso.'}
                        </p>

                        <button
                            onClick={handleConfirmModal}
                            style={styles.modalButton}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            {/* POPUP DE ERRO */}
            {erro && (
                <div style={styles.innerModalOverlay}>
                    <div style={styles.modalContent}>
                        <h2 style={styles.modalTitle}>Erro</h2>

                        <p style={styles.modalText}>{erro}</p>

                        <button
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
      backgroundColor: "#FFE866",
      color: "#000000",
    },
    notifyButton: {
      backgroundColor: "#FFE866",
      color: "#000000",
    },
    // Antes: overlay escuro fixo. Agora: container normal da página
    page: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        padding: '30px 0',
        boxSizing: 'border-box'
    },

    // Sem maxHeight/overflowY: a rolagem é a da própria página
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '28px',
        padding: '30px 40px',
        width: '100%',
        maxWidth: '600px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        boxSizing: 'border-box'
    },

    title: {
        fontSize: '26px',
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        marginTop: 0,
        marginBottom: '20px'
    },

    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
    },

    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },

    label: {
        fontSize: '15px',
        fontWeight: 'bold',
        color: '#000000'
    },

    input: {
        backgroundColor: '#E4ECF2',
        border: '1.5px solid #000000',
        borderRadius: '12px',
        height: '38px',
        padding: '0 14px',
        fontSize: '15px',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box'
    },

    fieldError: {
        color: '#B00020',
        fontSize: '13px'
    },

    buttonRow: {
        display: 'flex',
        gap: '16px',
        marginTop: '15px'
    },

    cancelButton: {
        flex: 1,
        backgroundColor: '#E1E8EC',
        color: '#000000',
        border: 'none',
        borderRadius: '18px',
        height: '44px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        outline: 'none'
    },

    submitButton: {
        flex: 1,
        backgroundColor: '#FFE866',
        color: '#000000',
        border: 'none',
        borderRadius: '18px',
        height: '44px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        outline: 'none'
    },

    innerModalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1100
    },

    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '30px',
        width: '90%',
        maxWidth: '380px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
    },

    modalTitle: {
        fontSize: '22px',
        fontWeight: 'bold',
        marginTop: 0,
        marginBottom: '12px',
        color: '#000000'
    },

    modalText: {
        fontSize: '15px',
        color: '#444444',
        marginBottom: '24px'
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
        outline: 'none'
    }
};