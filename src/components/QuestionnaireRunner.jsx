import { useEffect, useMemo, useState } from 'react';
import { scoreQuestionnaire } from '../lib/scoring';

export default function QuestionnaireRunner({
  questionnaire,
  onSubmit,
  initialRespondentName = '',
  initialSector = '',
}) {
  const [respondentName, setRespondentName] = useState(initialRespondentName);
  const [sector, setSector] = useState(initialSector);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setRespondentName(initialRespondentName);
    setSector(initialSector);
    setAnswers({});
    setSubmitted(false);
    setSubmitError('');
  }, [questionnaire?.id, initialRespondentName, initialSector]);

  const result = useMemo(
    () =>
      questionnaire
        ? scoreQuestionnaire(questionnaire, answers)
        : {
            answered: 0,
            total: 0,
            completionRate: 0,
            average: 0,
            score: 0,
            band: 'Sem respostas',
            dimensions: [],
            items: [],
          },
    [answers, questionnaire],
  );

  const isComplete = result.total > 0 && result.answered === result.total;
  const canSubmit = Boolean(respondentName.trim()) && Boolean(sector.trim()) && isComplete;

  if (!questionnaire) {
    return <div className="empty-state">Escolha um formulário para responder.</div>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      setSubmitError('Preencha nome, setor e todas as perguntas antes de enviar.');
      return;
    }

    try {
      await onSubmit({
        questionnaireId: questionnaire.id,
        respondentName,
        sector,
        notes: '',
        answers,
        score: result.score,
        band: result.band,
      });
      setSubmitted(true);
      setSubmitError('');
    } catch (error) {
      setSubmitError(error?.message || 'Não foi possível enviar a resposta agora.');
    }
  };

  const setAnswer = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  return (
    <form className="panel runner-panel" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <span className="eyebrow">Responder</span>
          <h2>{questionnaire.title}</h2>
          <p>Preencha seus dados e marque a opção que mais faz sentido.</p>
        </div>
        <div className="result-chip">
          <strong>{result.score}</strong>
          <span>{result.band}</span>
        </div>
      </div>

      <div className="editor-grid runner-info-grid">
        <label className="field">
          <span>Seu nome</span>
          <input required value={respondentName} onChange={(event) => setRespondentName(event.target.value)} />
        </label>
        <label className="field">
          <span>Setor</span>
          <input required value={sector} onChange={(event) => setSector(event.target.value)} />
        </label>
      </div>

      <div className="runner-progress">
        <div>
          <span>
            {result.answered}/{result.total} respondidas
          </span>
          <strong>{result.completionRate}% concluído</strong>
        </div>
        <div className="progress-track runner-track">
          <span className="progress-active" style={{ width: `${result.completionRate}%` }} />
        </div>
      </div>

      <div className="question-stack">
        {(questionnaire.questions ?? []).map((question, index) => (
          <article key={question.id} className="question-card">
            <div className="question-heading">
              <span className="question-index">{index + 1}</span>
              <p>{question.text}</p>
            </div>
            <div className="answers-row">
              {(questionnaire.scale?.labels ?? []).map((label, value) => (
                <label key={`${question.id}-${value}`} className="answer-option">
                  <input
                    type="radio"
                    name={question.id}
                    checked={answers[question.id] === value}
                    onChange={() => setAnswer(question.id, value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="actions-row">
        <button className="primary-button" type="submit" disabled={!canSubmit}>
          Salvar resposta
        </button>
        <span className="hint">
          {submitError || (submitted ? 'Resposta salva.' : 'Preencha tudo para enviar.')}
        </span>
      </div>
    </form>
  );
}
