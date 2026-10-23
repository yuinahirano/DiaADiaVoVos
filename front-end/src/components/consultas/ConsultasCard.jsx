import React, { useState, useEffect } from "react";
import { Clock, Stethoscope, CalendarDays, MapPin, FileText } from "lucide-react";
import ButtonDelete from "./ButtonDelete";
import ButtonEdit from "./ButtonEdit";
import { marcarCompareceu } from "../../service/idosoApi";
import "../../components/styles/Consultas.css";

export default function ConsultaCard({
  consulta,
  formatarData,
  onDelete,
  onEdit,
}) {
  const [compareceu, setCompareceu] = useState(
    Boolean(consulta?.compareceu)
  );
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setCompareceu(Boolean(consulta?.compareceu));
  }, [consulta?.compareceu]);

  if (!consulta) return null;

  const dataFormatada = formatarData
    ? formatarData(consulta.data)
    : consulta.data;

  const horarioFormatado = consulta.horario
    ? consulta.horario.slice(0, 5)
    : "Não informado";

  async function handleCompareceu() {
    if (salvando || compareceu) return;

    setCompareceu(true);
    setSalvando(true);

    try {
      await marcarCompareceu(consulta.id);
    } catch (erro) {
      setCompareceu(false);
      alert("Não foi possível atualizar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="consulta-card">
      <div className="consulta-card-topo">
        <div className="consulta-horario">
          <Clock size={27} />
          <span>{horarioFormatado}</span>
        </div>

        <div className="consulta-icone-medico">
          <Stethoscope size={42} strokeWidth={1.6} />
        </div>
      </div>

      <h2 className="consulta-card-titulo">
        {consulta.nome_medico}
      </h2>

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

      <label
        className="consulta-compareceu"
        style={{
          cursor: compareceu ? "default" : "pointer",
        }}
      >
        <span>Compareceu?</span>

        <input
          type="checkbox"
          checked={compareceu}
          onChange={handleCompareceu}
          disabled={salvando || compareceu}
          className="consulta-checkbox"
        />
      </label>

      <div className="consulta-card-acoes">
        <ButtonEdit onClick={() => onEdit(consulta)} />
        <ButtonDelete onClick={() => onDelete(consulta.id)} />
      </div>
    </div>
  );
}