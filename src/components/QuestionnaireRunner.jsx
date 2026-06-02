import { useMemo, useState } from 'react';
import { scoreQuestionnaire } from '../lib/scoring';

export default function QuestionnaireRunner({ questionnaire, onSubmit }) {
  const [respondentName, setRespondentName] = useState('');
  const [unit, setUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => scoreQuestionnaire(questionnaire, answers), [answers, questionnaire]);
  const hasDimensions = result.dimensions.length > 0;

  if (!questionnaire) {
    return <div className="empty-state">Selecione um questionário para responder.</div>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      questionnaireId: questionnaire.id,
      respondentName,
      unit,
      notes,
      answers,
      score: result.score,
      band: result.band,
    });
    setSubmitted(true);
  };

  const resetAnswer = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <span className="eyebrow">Responder</span>
          <h2>{questionnaire.title}</h2>
        </div>
        <div className="result-chip">
          <strong>{result.score}</strong>
          <span>{result.band}</span>
        </div>
      </div>

      <div className="editor-grid">
        <label className="field">
          <span>Nome do respondente</span>
          <input value={respondentName} onChange={(event) => setRespondentName(event.target.value)} />
        </label>
        <label className="field">
          <span>Setor / unidade</span>
          <input value={unit} onChange={(event) => setUnit(event.target.value)} />
        </label>
      </div>

      <label className="field">
        <span>Observações</span>
        <textarea rows="3" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>

      <div className="questionnaire-legend">
        {questionnaire.scale.labels.map((label, index) => (
          <span key={`${questionnaire.id}-legend-${index}`}>{label}</span>
        ))}
      </div>

      <div className="question-stack">
        {questionnaire.questions.map((question, index) => (
          <article key={question.id} className="question-card">
            <div className="question-heading">
              <span className="question-index">{index + 1}</span>
              <p>{question.text}</p>
            </div>
            <div className="answers-row">
              {questionnaire.scale.labels.map((label, value) => (
                <label key={`${question.id}-${value}`} className="answer-option">
                  <input
                    type="radio"
                    name={question.id}
                    checked={answers[question.id] === value}
                    onChange={() => resetAnswer(question.id, value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="actions-row">
        <button className="primary-button" type="submit">
          Salvar resposta
        </button>
        <span className="hint">
          {submitted
            ? 'Resposta salva localmente.'
            : `${result.answered}/${result.total} perguntas respondidas`}
        </span>
      </div>

      <div className="results-card runner-summary">
        <div className="section-title">
          <div>
            <h3>Resumo parcial</h3>
            <p>
              {result.completionRate}% concluído · média {result.score} · faixa {result.band}
            </p>
          </div>
        </div>

        {hasDimensions ? (
          <div className="result-list">
            {result.dimensions.map((dimension) => (
              <div key={dimension.dimension} className="result-list-item">
                <div>
                  <strong>{dimension.dimension}</strong>
                  <span>{dimension.answered} respostas</span>
                </div>
                <div className="result-chip compact">
                  <strong>{dimension.score}</strong>
                  <span>média</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state small">As dimensões aparecerão conforme as respostas forem preenchidas.</div>
        )}
      </div>
    </form>
  );
}
