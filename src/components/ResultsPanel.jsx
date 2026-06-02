import { scoreQuestionnaire } from '../lib/scoring';

function formatDate(dateString) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateString));
}

export default function ResultsPanel({ questionnaires, responses }) {
  const recent = responses.slice(0, 5);

  const summaries = questionnaires.map((questionnaire) => {
    const related = responses.filter((response) => response.questionnaireId === questionnaire.id);
    const latest = related[0] ? scoreQuestionnaire(questionnaire, related[0].answers) : null;
    const averageScore =
      related.length === 0
        ? 0
        : Math.round(
            related.reduce((acc, response) => acc + scoreQuestionnaire(questionnaire, response.answers).score, 0) /
              related.length,
          );

    return {
      ...questionnaire,
      relatedCount: related.length,
      averageScore,
      latestBand: latest?.band ?? 'Sem dados',
      latestCompletionRate: latest?.completionRate ?? 0,
    };
  });

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Resultados</span>
          <h2>Resumo da operação</h2>
        </div>
        <span className="badge">Armazenamento local</span>
      </div>

      <div className="metrics-grid">
        <article className="metric-card">
          <span>Total de questionários</span>
          <strong>{questionnaires.length}</strong>
        </article>
        <article className="metric-card">
          <span>Total de respostas</span>
          <strong>{responses.length}</strong>
        </article>
        <article className="metric-card">
          <span>Última atividade</span>
          <strong>{responses[0] ? formatDate(responses[0].createdAt) : 'Sem respostas'}</strong>
        </article>
      </div>

      <div className="split-grid">
        <div className="results-card">
          <h3>Desempenho por questionário</h3>
          <div className="result-list">
            {summaries.map((item) => (
              <div key={item.id} className="result-list-item">
                <div>
                  <strong>{item.title}</strong>
                  <span>
                    {item.relatedCount} respostas · {item.latestBand}
                  </span>
                </div>
                <div className="result-chip compact">
                  <strong>{item.averageScore}</strong>
                  <span>{item.latestCompletionRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="results-card">
          <h3>Respostas recentes</h3>
          <div className="recent-list">
            {recent.length === 0 ? (
              <div className="empty-state small">Nenhuma resposta registrada ainda.</div>
            ) : (
              recent.map((response) => {
                const questionnaire = questionnaires.find((item) => item.id === response.questionnaireId);
                return (
                  <article key={response.id} className="recent-item">
                    <strong>{questionnaire?.title ?? 'Questionário removido'}</strong>
                    <span>
                      {response.respondentName || 'Sem nome'} · {response.band} · {response.score} pontos
                    </span>
                    <span>{formatDate(response.createdAt)}</span>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
