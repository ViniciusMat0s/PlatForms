export default function QuestionnaireCard({ questionnaire, isSelected, onSelect }) {
  const { title, subtitle, audience, domain, questions } = questionnaire;

  return (
    <button
      type="button"
      className={`questionnaire-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(questionnaire.id)}
    >
      <div className="card-topline">
        <span>{domain}</span>
        <span>{audience}</span>
      </div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
      <div className="card-meta">
        <span>{questions.length} perguntas</span>
        <span>{questionnaire.scale.labels.length} opções</span>
      </div>
    </button>
  );
}
