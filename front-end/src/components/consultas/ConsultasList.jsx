import React from "react";
import ConsultaCard from "./ConsultasCard";
import "../../components/styles/Consultas.css";

export default function ConsultasList({ consultas, formatarData, onDelete, onEdit }) {
  if (!consultas || consultas.length === 0) return null;

  return (
    <div className="consultas-grid">
      {consultas.map((consulta) => (
        <ConsultaCard
          key={consulta.id}
          consulta={consulta}
          formatarData={formatarData}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

const styles = {
  listGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr', // Força 2 colunas iguais lado a lado
    gap: '20px', // Espaçamento grande entre os dois cards
    width: '100%'
  },
};