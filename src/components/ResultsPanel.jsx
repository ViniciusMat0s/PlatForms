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
  const recent = responses.slice(0, 8);

  return (
    <section className="workspace-page">
      <header className="workspace-header">
        <div>
          <span className="eyebrow">Resultados</span>
          <h1>Respostas</h1>
          <p>Resumo rapido, medias e as ultimas respostas recebidas.</p>
        </div>

        <div className="workspace-actions">
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
      </header>

      <div className="workspace-summary">
        <div className="summary-chip">
          <span>Formularios</span>
          <strong>{metrics.counts.total}</strong>
        </div>
        <div className="summary-chip">
          <span>Respostas</span>
          <strong>{metrics.counts.responses}</strong>
        </div>
        <div className="summary-chip">
          <span>Media geral</span>
          <strong>{metrics.averageScore.toFixed(1)}</strong>
        </div>
      </div>

      <div className="table-shell">
        <div className="table-shell-header">
          <div className="table-shell-title">
            <h2>Ultimas respostas</h2>
            <span>{recent.length} itens</span>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Formulario</th>
                <th>Pessoa</th>
                <th>Pontuacao</th>
                <th>Faixa</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state small">Nenhuma resposta registrada.</div>
                  </td>
                </tr>
              ) : (
                recent.map((response) => {
                  const questionnaire = questionnaires.find((item) => item.id === response.questionnaireId);
                  return (
                    <tr key={response.id}>
                      <td>
                        <strong>{questionnaire?.title ?? 'Formulario removido'}</strong>
                        <span>{questionnaire?.domain ?? 'Sem categoria'}</span>
                      </td>
                      <td>{response.respondentName || 'Sem nome'}</td>
                      <td>{response.score}</td>
                      <td>{response.band}</td>
                      <td>{formatDate(response.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
