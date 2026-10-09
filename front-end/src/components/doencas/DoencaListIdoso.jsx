import DoencaCardIdoso from './DoencaCardIdoso';

export default function DoencasListIdoso({ doencas }) {
  return (
    <div className="lista-grid">
      {doencas?.map((doenca) => (
        <DoencaCardIdoso
          key={doenca.id}
          condicao={doenca}
        />
      ))}
    </div>
  );
}