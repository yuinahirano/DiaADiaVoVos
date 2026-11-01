import { useEffect } from 'react';
import {
    useAddMedicamento,
    OPCOES_VEZES_POR_DIA,
    OPCOES_INTERVALO_HORAS
} from '../../hooks/useAddMed';
import { useIdososDoCuidador } from '../../hooks/useIdososDoCuidador';

export default function CadastrarMedicamento({ isOpen, onClose, medicamentoEditando = null }) {
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
    } = useAddMedicamento(medicamentoEditando);

    const { idosos, loading: loadingIdosos, erro: erroIdosos } = useIdososDoCuidador();

    useEffect(() => {
        if (!emEdicao && idosos.length === 1 && !formData.idIdoso) {
            handleChange({ target: { name: 'idIdoso', value: String(idosos[0].id) } });
        }
    }, [idosos, emEdicao]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setEfetuarCadastro(true);
    };

    const handleConfirmModal = () => {
        setSucesso(false);
        onClose();
    };

    const handleErrorModal = () => {
        setErro(null);
    };

    // BUG corrigido: o backend exige tipoFrequencia e valorFrequencia
    // (a tabela "medicamento" tem tipo_frequencia / valor_frequencia como
    // NOT NULL). O formulário não enviava esses campos, então o cadastro
    // falhava ou salvava com valores de fallback. Os campos abaixo seguem
    // o enum TipoFrequencia do backend: "vezes_por_dia" | "intervalo_horas".
    const tipoFrequenciaAtual = formData.tipoFrequencia || 'vezes_por_dia';

    const labelValorFrequencia =
        tipoFrequenciaAtual === 'intervalo_horas'
            ? 'A cada quantas horas:'
            : 'Quantas vezes por dia:';

    // Opções pré-definidas, nunca texto livre: elimina o caso de
    // mandar valorFrequencia vazio/inválido pro backend.
    const opcoesValorFrequencia =
        tipoFrequenciaAtual === 'intervalo_horas'
            ? OPCOES_INTERVALO_HORAS
            : OPCOES_VEZES_POR_DIA;

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.card}>
                <h1 style={styles.title}>
                    {emEdicao ? 'Editar Medicamento' : 'Cadastrar Medicamento'}
                </h1>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label} htmlFor="idIdoso">Idoso:</label>
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
                                {loadingIdosos ? 'Carregando idosos...' : 'Selecione o idoso'}
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

                    {/* NOVO: campo exigido pelo backend (tipo_frequencia) */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label} htmlFor="tipoFrequencia">Frequência:</label>
                        <select
                            id="tipoFrequencia"
                            name="tipoFrequencia"
                            value={tipoFrequenciaAtual}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        >
                            <option value="vezes_por_dia">Vezes por dia</option>
                            <option value="intervalo_horas">A cada X horas</option>
                        </select>
                    </div>

                    {/* NOVO: campo exigido pelo backend (valor_frequencia).
                        Select com opções pré-definidas em vez de número
                        livre, para nunca mandar valor vazio/inválido. */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label} htmlFor="valorFrequencia">
                            {labelValorFrequencia}
                        </label>
                        <select
                            id="valorFrequencia"
                            name="valorFrequencia"
                            value={formData.valorFrequencia}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        >
                            {opcoesValorFrequencia.map((valor) => (
                                <option key={valor} value={valor}>
                                    {tipoFrequenciaAtual === 'intervalo_horas'
                                        ? `A cada ${valor} horas`
                                        : `${valor}x ao dia`}
                                </option>
                            ))}
                        </select>
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
                            {loading
                                ? 'Salvando...'
                                : (emEdicao ? 'Salvar alterações' : 'Cadastrar')}
                        </button>
                    </div>
                </form>
            </div>

            {sucesso && (
                <div style={styles.innerModalOverlay}>
                    <div style={styles.modalContent}>
                        <h2 style={styles.modalTitle}>Sucesso!</h2>
                        <p style={styles.modalText}>
                            {emEdicao
                                ? 'O medicamento foi atualizado com sucesso.'
                                : 'O medicamento foi salvo com sucesso.'}
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
                            {erro}
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
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '28px',
        padding: '30px 40px',
        width: '100%',
        maxHeight: '600px',
        maxWidth: '500px',
        overflowY: 'auto',
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
        justifyContent: 'space-between',
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