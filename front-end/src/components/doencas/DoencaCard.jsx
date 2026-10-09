import React from "react";
import ButtonEdit from "../medicamentos/BotaoEditar";
import ButtonDelete from "../medicamentos/BotaoDeletar";

export default function DoencaCard({ condicao, onDelete, onEdit }) {
  if (!condicao) return null;

  return (
    <div className="doenca-card">
      <h2 className="doenca-card-titulo">{condicao.nome}</h2>

      <div className="doenca-card-info">
        <p className="doenca-card-label">
          Descrição: <span className="doenca-card-valor">{condicao.descricao}</span>
        </p>
      </div>

      <div className="card-acoes-rodape">
        <ButtonEdit onClick={() => onEdit(condicao)} />
        <ButtonDelete onClick={() => onDelete(condicao.id)} />
      </div>
    </div>
  );
}