
import React from "react";
import {
  Clock,
  Stethoscope,
  CalendarDays,
  MapPin,
  FileText
} from "lucide-react";

import "../../components/styles/Consultas.css";

export default function ConsultaCardIdoso({ consulta, formatarData }) {
  if (!consulta) return null;

  const dataFormatada = formatarData
    ? formatarData(consulta.data)
    : consulta.data;

  const horarioFormatado = consulta.horario
    ? consulta.horario.slice(0, 5)
    : "Não informado";

  return (
    <div className="consulta-card consulta-card-idoso">

      {/* Horário e ícone */}
      <div className="consulta-card-topo">
        <div className="consulta-horario">
          <Clock size={27} />
          <span>{horarioFormatado}</span>
        </div>

        <div className="consulta-icone-medico">
          <Stethoscope size={42} strokeWidth={1.6} />
        </div>
      </div>

      {/* Nome do médico */}
      <h2 className="consulta-card-titulo">
        {consulta.nome_medico}
      </h2>

      {/* Informações da consulta */}
      <div className="consulta-detalhes">

        {dataFormatada && (
          <div className="consulta-detalhe">
            <CalendarDays size={22} />

            <div>
              <strong>Data</strong>
              <span>{dataFormatada}</span>
            </div>
          </div>
        )}

        <div className="consulta-detalhe">
          <MapPin size={22} />

          <div>
            <strong>Local</strong>
            <span>{consulta.local_consulta || "Não informado"}</span>
          </div>
        </div>

        {consulta.descricao && (
          <div className="consulta-detalhe consulta-descricao">
            <FileText size={22} />

            <div>
              <strong>Descrição</strong>
              <span>{consulta.descricao}</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}