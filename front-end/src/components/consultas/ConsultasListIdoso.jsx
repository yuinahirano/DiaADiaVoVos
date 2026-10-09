import React from "react";
import ConsultaCardIdoso from "./ConsultasCardIdoso";

export default function ConsultasListIdoso({ consultas, formatarData }) {
  if (!consultas || consultas.length === 0) return null;

  return (
    <div className="lista-grid">
      {consultas.map((consulta) => (
        <ConsultaCardIdoso
          key={consulta.id}
          consulta={consulta}
          formatarData={formatarData}
        />
      ))}
    </div>
  );
}