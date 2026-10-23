import DoencaCard from "./DoencaCard";
import "../styles/CuidadorLayout.css";

export default function DoencasList({ doencas, onDelete, onEdit }) {
  return (
    <div className="cuidador-grid">
      {doencas?.map((doenca) => (
        <DoencaCard
          key={doenca.id}
          condicao={doenca}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
