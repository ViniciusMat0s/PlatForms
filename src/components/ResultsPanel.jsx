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
  const recent = responses.slice(0, 5);

  return (
    <section className="panel results-page">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Resultados</span>
          <h2>Resumo rápido</h2>
          <p>Veja o que já foi respondido e baixe o que precisar.</p>
        </div>
      </div>

      <div className="results-actions">
        <button className="ghost-button" type="button" onClick={() => exportQuestionnaireSummaryCsv(questionnaires, responses)}>
          Baixar resumo
        </button>
        <button className="ghost-button" type="button" onClick={() => exportResponsesCsv(questionnaires, responses)}>
          Baixar respostas
        </button>
        <button className="primary-button" type="button" onClick={() => exportSnapshotJson(questionnaires, responses)}>
          Baixar JSON
        </button>
        <button className="ghost-button" type="button" onClick={() => void exportReportPdf(questionnaires, responses)}>
          Baixar PDF
        </button>
      </div>

      <div className="metrics-grid compact-metrics">
        <ResultMetric label="Formulários" value={metrics.counts.total} hint="Modelos cadastrados" />
        <ResultMetric label="Respostas" value={metrics.counts.responses} hint="Registros recebidos" />
        <ResultMetric label="Média geral" value={metrics.averageScore.toFixed(1)} hint="Pontuação média" />
      </div>

      <div className="results-compact-grid">
        <article className="results-card">
          <div className="section-title">
            <div>
              <h3>Desempenho</h3>
              <p>Leitura simples dos formulários mais usados.</p>
            </div>
          </div>

          <div className="compact-list">
            {metrics.summaries.length === 0 ? (
              <div className="empty-state small">Nenhum formulário disponível.</div>
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
              <h3>Respostas recentes</h3>
              <p>Os últimos envios aparecem aqui.</p>
            </div>
          </div>

          <div className="compact-list">
            {recent.length === 0 ? (
              <div className="empty-state small">Ainda não há respostas registradas.</div>
            ) : (
              recent.map((response) => {
                const questionnaire = questionnaires.find((item) => item.id === response.questionnaireId);
                return (
                  <article key={response.id} className="compact-response">
                    <strong>{questionnaire?.title ?? 'Formulário removido'}</strong>
                    <span>{response.respondentName || 'Sem nome'} · {response.score} pontos</span>
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
