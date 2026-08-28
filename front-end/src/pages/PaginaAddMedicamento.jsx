import { useNavigate } from 'react-router-dom';
import { useAddMedicamento } from '../hooks/useAddMed';

export default function CadastrarMedicamento({isOpen, onClose}) {
    const {
        formData,
        handleChange,
        setEfetuarCadastro,
        sucesso,
        setSucesso,
        loading,
        erro,
        setErro
    } = useAddMedicamento();

    //nulo se o modal tiver fechado
    if (!isOpen) return null;

    //no clique do cadastro altera o estado gatilho no hook para iniciar a requisição
    const handleSubmit = (e) => {
        e.preventDefault(); //impede recarregamento da imagem
        setEfetuarCadastro(true);
    };

    //modal de confirmação de sucesso
    const handleConfirmModal = () => {
        setSucesso(false);
        onClose(); //fecha o modal após a confirmação
    };

    //modal de confirmação quando da erro
    const handleErrorModal = () => {
        setErro(null); //fecha apenas o modal de erro
    };

    //cancelar
    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.card}>
                <h1 style={styles.title}>Cadastrar Medicamento</h1>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label} htmlFor="nome">Nome:</label>
                        <input
                            id="nome"
                            name="nome"
                            type="text"
                            value={formData.nome}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label} htmlFor="dosagem">Dosagem:</label>
                        <input
                            id="dosagem"
                            name="dosagem"
                            type="text"
                            value={formData.dosagem}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label} htmlFor="horario">Horário:</label>
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
                        <label style={styles.label} htmlFor="frequencia">Frequência:</label>
                        <input
                            id="frequencia"
                            name="frequencia"
                            type="text"
                            value={formData.frequencia}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label} htmlFor="observacoes">Observações:</label>
                        <input
                            id="observacoes"
                            name="observacoes"
                            type="text"
                            value={formData.observacoes}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.buttonRow}>
                        <button
                            type="button"
                            onClick={onClose}
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
                            {loading ? 'Salvando...' : 'Cadastrar'}
                        </button>
                    </div>
                </form>
            </div>

            {/* submodal de confirmação */}
            {sucesso && (
                <div style={styles.innerModalOverlay}>
                    <div style={styles.modalContent}>
                        <h2 style={styles.modalTitle}>Sucesso!</h2>
                        <p style={styles.modalText}>
                            O medicamento foi salvo com sucesso.
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

            {erro && (
                <div style={styles.innerModalOverlay}>
                    <div style={styles.modalContent}>
                        <h2 style={styles.modalTitle}>Erro</h2>
                        <p style={styles.modalText}>
                            Falha ao cadastrar o medicamento.
                        </p>
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

//estilização
const styles = {
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',  // Garante a largura total da viewport
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
    },

    //card do modal
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '28px',
        padding: '30px 40px',
        width: '100%',
        maxHeight: '500px',
        maxWidth: '500px',
        overflowY: 'auto', //permite rolar o card pelo eixo y (cima e baixo)
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
    buttonRow: {
        display: 'flex',
        justify: 'space-between',
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