import React from "react";

export default function MedicamentoCardIdoso({ medicamento }) {
  if (!medicamento) return null;

  return (
    <div className="medicamento-card">
      <h2 className="consulta-card-titulo">{medicamento.nome}</h2>

      {medicamento.dosagem && (
        <div className="card-pilula-destaque">
          Dosagem: {medicamento.dosagem}
        </div>
      )}

      <div className="consulta-card-info">
        <p className="consulta-card-label">
          Horário: <span className="consulta-card-valor">{medicamento.horario?.slice(0, 5)}</span>
        </p>

        <p className="consulta-card-label">
          Frequência: <span className="consulta-card-valor">{medicamento.frequencia}</span>
        </p>

        {medicamento.observacoes && (
          <p className="consulta-card-label">
            Observações: <span className="consulta-card-valor">{medicamento.observacoes}</span>
          </p>
        )}
      </div>
    </div>
  );
}