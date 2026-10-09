import React from "react";

export default function ConsultaCardIdoso({ consulta, formatarData }) {
  if (!consulta) return null;

  const dataFormatada = formatarData ? formatarData(consulta.data) : consulta.data;
  const horarioFormatado = consulta.horario ? consulta.horario.slice(0, 5) : "";

  return (
    <div className="consulta-card">
      <h2 className="consulta-card-titulo">{consulta.nome_medico}</h2>

      <div className="consulta-card-info">
        {dataFormatada && (
          <p className="consulta-card-label">
            Data: <span className="consulta-card-valor">{dataFormatada}</span>
          </p>
        )}

        <p className="consulta-card-label">
          Horário: <span className="consulta-card-valor">{horarioFormatado}</span>
        </p>

        <p className="consulta-card-label">
          Local: <span className="consulta-card-valor">{consulta.local_consulta}</span>
        </p>

        {consulta.descricao && (
          <p className="consulta-card-label">
            Descrição: <span className="consulta-card-valor">{consulta.descricao}</span>
          </p>
        )}
      </div>
    </div>
  );
}