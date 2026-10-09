import DoencaCard from "./DoencaCard";

export default function DoencasList({ doencas, onDelete, onEdit }) {
  return (
    <div className="home-idoso-consultas">
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