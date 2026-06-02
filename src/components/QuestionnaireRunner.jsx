import { useMemo, useState } from 'react';
import { scoreQuestionnaire } from '../lib/scoring';

export default function QuestionnaireRunner({ questionnaire, onSubmit }) {
  const [respondentName, setRespondentName] = useState('');
  const [unit, setUnit] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => scoreQuestionnaire(questionnaire, answers), [answers, questionnaire]);

  if (!questionnaire) {
    return <div className="empty-state">Selecione um questionário para responder.</div>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      questionnaireId: questionnaire.id,
      respondentName,
      unit,
      notes: '',
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
    <form className="panel runner-panel" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <span className="eyebrow">Responder</span>
          <h2>{questionnaire.title}</h2>
          <p>Preencha os dados básicos e responda as perguntas abaixo.</p>
        </div>
        <div className="result-chip">
          <strong>{result.score}</strong>
          <span>{result.band}</span>
        </div>
      </div>

      <div className="editor-grid runner-info-grid">
        <label className="field">
          <span>Nome</span>
          <input value={respondentName} onChange={(event) => setRespondentName(event.target.value)} />
        </label>
        <label className="field">
          <span>Unidade</span>
          <input value={unit} onChange={(event) => setUnit(event.target.value)} />
        </label>
      </div>

      <div className="runner-progress">
        <div>
          <span>{result.answered}/{result.total} respondidas</span>
          <strong>{result.completionRate}% concluído</strong>
        </div>
        <div className="progress-track runner-track">
          <span className="progress-active" style={{ width: `${result.completionRate}%` }} />
        </div>
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
        <span className="hint">{submitted ? 'Resposta salva.' : 'A resposta será salva ao final.'}</span>
      </div>
    </form>
  );
}
