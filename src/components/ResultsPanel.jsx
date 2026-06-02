import { buildDashboardMetrics } from '../lib/dashboard';
import { exportQuestionnaireSummaryCsv, exportResponsesCsv, exportReportPdf, exportSnapshotJson } from '../lib/export';

function formatDate(dateString) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateString));
}

function ResultMetric({ label, value, hint }) {
  return (
    <article className="metric-card">
      <div className="metric-card-icon">
        <span className="metric-dot" />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {hint ? <small>{hint}</small> : null}
      </div>
    </article>
  );
}

export default function ResultsPanel({ questionnaires, responses }) {
  const metrics = buildDashboardMetrics(questionnaires, responses);
  const recent = responses.slice(0, 6);

  return (
    <section className="panel results-page">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Resultados</span>
          <h2>Leitura rápida</h2>
          <p>Veja os números principais e as últimas respostas sem excesso de informação.</p>
        </div>
      </div>

      <div className="results-actions">
        <button className="ghost-button" type="button" onClick={() => exportQuestionnaireSummaryCsv(questionnaires, responses)}>
          Resumo CSV
        </button>
        <button className="ghost-button" type="button" onClick={() => exportResponsesCsv(questionnaires, responses)}>
          Respostas CSV
        </button>
        <button className="primary-button" type="button" onClick={() => exportSnapshotJson(questionnaires, responses)}>
          JSON
        </button>
        <button className="ghost-button" type="button" onClick={() => void exportReportPdf(questionnaires, responses)}>
          PDF
        </button>
      </div>

      <div className="metrics-grid compact-metrics">
        <ResultMetric label="Formulários" value={metrics.counts.total} hint="Modelos" />
        <ResultMetric label="Respostas" value={metrics.counts.responses} hint="Envios" />
        <ResultMetric label="Média" value={metrics.averageScore.toFixed(1)} hint="Geral" />
      </div>

      <div className="results-stack">
        <article className="results-card">
          <div className="section-title">
            <div>
              <h3>Médias por formulário</h3>
              <p>Uma visão direta do desempenho de cada modelo.</p>
            </div>
          </div>

          <div className="compact-list">
            {metrics.summaries.length === 0 ? (
              <div className="empty-state small">Ainda não há formulários cadastrados.</div>
            ) : (
              metrics.summaries.map((item, index) => (
                <article key={item.id} className="compact-row">
                  <span className="compact-index">{index + 1}</span>
                  <div className="compact-copy">
                    <strong>{item.title}</strong>
                    <span>{item.relatedCount} respostas</span>
                  </div>
                  <div className="compact-values">
                    <strong>{item.averageScore}</strong>
                    <span>{item.latestBand}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </article>

        <article className="results-card">
          <div className="section-title">
            <div>
              <h3>Últimas respostas</h3>
              <p>Os envios mais recentes ficam reunidos aqui.</p>
            </div>
          </div>

          <div className="compact-list">
            {recent.length === 0 ? (
              <div className="empty-state small">Nenhuma resposta registrada.</div>
            ) : (
              recent.map((response) => {
                const questionnaire = questionnaires.find((item) => item.id === response.questionnaireId);
                return (
                  <article key={response.id} className="compact-response">
                    <strong>{questionnaire?.title ?? 'Formulário removido'}</strong>
                    <span>
                      {response.respondentName || 'Sem nome'} · {response.score} pontos
                    </span>
                    <small>{formatDate(response.createdAt)}</small>
                  </article>
                );
              })
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
