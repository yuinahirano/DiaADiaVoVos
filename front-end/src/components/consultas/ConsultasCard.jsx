import React from "react";
import ButtonDelete from "./ButtonDelete";
import ButtonEdit from "./ButtonEdit";
import "../../components/styles/Consultas.css";

export default function ConsultaCard({ consulta, formatarData, onDelete, onEdit }) {
  if (!consulta) return null;

  const dataFormatada = formatarData ? formatarData(consulta.data) : consulta.data;
  const horarioFormatado = consulta.horario ? consulta.horario.slice(0, 5) : "";

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

      {/* Container de Ações no rodapé do Card */}
      <div style={styles.buttonContainer}>
        <ButtonEdit onClick={() => onEdit(consulta)} />
        <ButtonDelete onClick={() => onDelete(consulta.id)} />
      </div>
    </div>
  );
}

const styles = {
  buttonContainer: {
    alignSelf: 'flex-end',
    marginTop: 'auto',
    display: 'flex',
    gap: '10px',
  },
};