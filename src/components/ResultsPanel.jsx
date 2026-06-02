import { buildDashboardMetrics } from '../lib/dashboard';
import { exportQuestionnaireSummaryCsv, exportResponsesCsv, exportReportPdf, exportSnapshotJson } from '../lib/export';

function formatDate(dateString) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateString));
}

export default function ResultsPanel({ questionnaires, responses }) {
  const metrics = buildDashboardMetrics(questionnaires, responses);
  const recent = responses.slice(0, 5);

  return (
    <section className="panel results-page">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Resultados</span>
          <h2>Resumo da operação</h2>
        </div>
        <div className="header-actions">
          <button
            className="ghost-button"
            type="button"
            onClick={() => exportQuestionnaireSummaryCsv(questionnaires, responses)}
          >
            Exportar resumo CSV
          </button>
          <button className="ghost-button" type="button" onClick={() => exportResponsesCsv(questionnaires, responses)}>
            Exportar respostas CSV
          </button>
          <button className="primary-button" type="button" onClick={() => exportSnapshotJson(questionnaires, responses)}>
            Exportar JSON
          </button>
          <button className="ghost-button" type="button" onClick={() => void exportReportPdf(questionnaires, responses)}>
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        <article className="metric-card">
          <span>Total de questionários</span>
          <strong>{metrics.counts.total}</strong>
        </article>
        <article className="metric-card">
          <span>Total de respostas</span>
          <strong>{metrics.counts.responses}</strong>
        </article>
        <article className="metric-card">
          <span>Cobertura</span>
          <strong>{metrics.coverage}%</strong>
        </article>
      </div>

      <div className="split-grid">
        <div className="results-card">
          <div className="section-title">
            <div>
              <h3>Desempenho por questionário</h3>
              <p>Visão resumida dos instrumentos cadastrados.</p>
            </div>
          </div>

          <div className="result-list">
            {metrics.summaries.length === 0 ? (
              <div className="empty-state small">Nenhum questionário disponível no momento.</div>
            ) : (
              metrics.summaries.map((item, index) => (
                <div key={item.id} className="result-list-item">
                  <div className="result-rank">
                    <span>{index + 1}</span>
                  </div>
                  <div className="result-copy">
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
              ))
            )}
          </div>
        </div>

        <div className="results-card">
          <div className="section-title">
            <div>
              <h3>Respostas recentes</h3>
              <p>Últimos registros recebidos pela plataforma.</p>
            </div>
          </div>

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
