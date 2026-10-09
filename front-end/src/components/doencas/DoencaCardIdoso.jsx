import React from "react";

export default function DoencaCardIdoso({ condicao }) {
  if (!condicao) return null;

  return (
    <div className="doenca-card">
      <h2 className="doenca-card-titulo">{condicao.nome}</h2>

      <div className="doenca-card-info">
        <p className="doenca-card-label">
          Descrição: <span className="doenca-card-valor">{condicao.descricao}</span>
        </p>
      </div>
    </div>
  );
}