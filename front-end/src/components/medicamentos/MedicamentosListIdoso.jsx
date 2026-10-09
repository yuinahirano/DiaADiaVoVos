import MedicamentoCardIdoso from "./MedicamentosCardIdoso";

export default function MedicamentosListIdoso({ medicamentos }) {
  return (
    <div className="lista-grid">
      {medicamentos?.map((medicamento) => (
        <MedicamentoCardIdoso
          key={medicamento.id}
          medicamento={medicamento}
        />
      ))}
    </div>
  );
}