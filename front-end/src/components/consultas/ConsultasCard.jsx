import React, { useState, useEffect } from "react";
import ButtonDelete from "./ButtonDelete";
import ButtonEdit from "./ButtonEdit";
import { marcarCompareceu } from "../../service/idosoApi";
import "../../components/styles/Consultas.css";

export default function ConsultaCard({ consulta, formatarData, onDelete, onEdit }) {
  const [compareceu, setCompareceu] = useState(Boolean(consulta?.compareceu));
  const [salvando, setSalvando] = useState(false);

  // mantém o checkbox sincronizado quando a lista é recarregada
  useEffect(() => {
    setCompareceu(Boolean(consulta?.compareceu));
  }, [consulta?.compareceu]);

  if (!consulta) return null;

  const dataFormatada = formatarData ? formatarData(consulta.data) : consulta.data;
  const horarioFormatado = consulta.horario ? consulta.horario.slice(0, 5) : "";

  async function handleCompareceu() {
    if (salvando || compareceu) return;

    const valorAnterior = compareceu;
    setCompareceu(!valorAnterior); // muda na tela na hora
    setSalvando(true);

    try {
      await marcarCompareceu(consulta.id);
    } catch (erro) {
      setCompareceu(valorAnterior); // se der erro, desfaz
      alert("Não foi possível atualizar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="card">
      <h2 className="card-title">{consulta.nome_medico}</h2>

      <div className="card-info">
        {dataFormatada && (
          <p className="card-label">
            Data:{" "}
            <span className="card-valor">{dataFormatada}</span>
          </p>
        )}

        <p className="card-label">
          Horário:{" "}
          <span className="card-valor">{horarioFormatado}</span>
        </p>

        <p className="card-label">
          Local:{" "}
          <span className="card-valor">{consulta.local_consulta}</span>
        </p>

        {consulta.descricao && (
          <p className="card-label">
            Descrição:{" "}
            <span className="card-valor">{consulta.descricao}</span>
          </p>
        )}
      </div>

      {/* Compareceu */}
      <label
        style={{
          ...styles.compareceuLabel,
          cursor: compareceu ? "default" : "pointer",
        }}
      >
        Compareceu:
        <input
          type="checkbox"
          checked={compareceu}
          onChange={handleCompareceu}
          disabled={salvando || compareceu}
          style={{
            ...styles.checkbox,
            ...(compareceu ? styles.checkboxMarcado : {}),
            cursor: compareceu ? "default" : "pointer",
          }}
        />
      </label>

      {/* Container de Ações no rodapé do Card */}
      <div style={styles.buttonContainer}>
        <ButtonEdit onClick={() => onEdit(consulta)} />
        <ButtonDelete onClick={() => onDelete(consulta.id)} />
      </div>
    </div>
  );
}

const iconeCheck =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='3'%3E%3Cpath d='M5 12l5 5 9-10'/%3E%3C/svg%3E\")";

const styles = {
  compareceuLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "12px",
    marginBottom: "12px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  checkbox: {
    appearance: "none",
    WebkitAppearance: "none",
    width: "24px",
    height: "24px",
    margin: 0,
    border: "2px solid #000",
    borderRadius: "6px",
    backgroundColor: "#fff",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "80%",
    cursor: "pointer",
  },
  checkboxMarcado: {
    backgroundColor: "#FFE866",
    backgroundImage: iconeCheck,
  },
  buttonContainer: {
  display: "flex",
  width: "100%",
  gap: "12px",
  marginTop: "auto",
  paddingTop: "16px",
  boxSizing: "border-box",
},
};