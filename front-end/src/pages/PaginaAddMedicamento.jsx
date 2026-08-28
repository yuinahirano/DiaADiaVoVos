import { useNavigate } from 'react-router-dom';
import { useAddMedicamento } from '../hooks/useAddMed';

export default function CadastrarMedicamento() {
    const navigate = useNavigate(); //para navegação de telas

    const {
        formData,
        handleChange,
        setEfetuarCadastro,
        sucesso,
        setSucesso,
        loading
    } = useAddMedicamento();

    //no clique do cadastro altera o estado gatilho no hook para iniciar a requisição
    const handleSubmit = (e) => {
        e.preventDefault(); //impede recarregamento da imagem
        setEfetuarCadastro(true);
    };

    //função do botão OK do modal de confirmação
    const handleConfirmModal = () => {
        setSucesso(false);
        navigate(-1);
    };

    //cancelar
    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <h1 style={styles.title}>Cadastrar Medicamento</h1>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Nome */}
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

                    {/* Dosagem */}
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

                    {/* Horário */}
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

                    {/* Frequência */}
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

                    {/* Observações */}
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

                    {/* Botões do Formulário */}
                    <div style={styles.buttonRow}>
                        <button
                            type="button"
                            onClick={handleCancel}
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

            {/* Modal exibido apenas quando o estado 'sucesso' retornado pelo Hook for verdadeiro */}
            {sucesso && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h2 style={styles.modalTitle}>Medicamento Cadastrado!</h2>
                        <p style={styles.modalText}>
                            O medicamento foi salvo com sucesso. Você será redirecionado para a lista.
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
        </div>
    );
}

//estilização
const styles = {
    pageContainer: {
        backgroundColor: '#EBF3FF',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '28px',
        padding: '40px 50px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        boxSizing: 'border-box'
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        marginTop: 0,
        marginBottom: '25px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    label: {
        fontSize: '16px',
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
        outline: 'none'
    },
    buttonRow: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '20px',
        marginTop: '20px'
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#E1E8EC',
        color: '#000000',
        border: 'none',
        borderRadius: '18px',
        height: '46px',
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
        height: '46px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        outline: 'none'
    },

    //MODAL
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '30px',
        width: '90%',
        maxWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
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
        marginBottom: '24px',
        lineHeight: '1.4'
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