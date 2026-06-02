import Icon from './Icon';
import { buildDashboardMetrics } from '../lib/dashboard';

function getInitials(name) {
  if (!name) return 'FP';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function StatusPill({ questionnaire }) {
  const status = questionnaire.status ?? 'rascunho';

  return <span className={`table-pill status-${status}`}>{status}</span>;
}

export default function DashboardPanel({
  currentUser,
  questionnaires,
  visibleQuestionnaires,
  responses,
  selectedQuestionnaire,
  selectedQuestionnaireId,
  onCreateQuestionnaire,
  onOpenView,
  onSelectQuestionnaire,
  onStartQuestionnaire,
  canManageContent = true,
  activeView = 'dashboard',
  syncStatus,
  readerMode = false,
}) {
  const metrics = buildDashboardMetrics(questionnaires, responses);
  const rows = visibleQuestionnaires ?? questionnaires;
  const preview =
    rows.find((item) => item.id === selectedQuestionnaireId) ??
    selectedQuestionnaire ??
    rows[0] ??
    null;

  const title = activeView === 'biblioteca' ? 'Formulários' : 'Visão geral';
  const subtitle =
    activeView === 'biblioteca'
      ? 'Veja os formulários cadastrados, abra um modelo e envie para outras pessoas.'
      : readerMode
        ? 'Escolha um formulário e responda direto pela plataforma.'
        : 'Crie formulários, envie rapidamente e acompanhe as respostas em uma tela simples.';

  return (
    <section className="workspace-page">
      <header className="workspace-header">
        <div>
          <span className="eyebrow">Workspace</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        <div className="workspace-actions">
          {readerMode ? (
            <button className="ghost-button" type="button" onClick={() => onOpenView('responder')}>
              Ver formulários
            </button>
          ) : (
            <button className="ghost-button" type="button" onClick={() => onOpenView('resultados')}>
              Ver respostas
            </button>
          )}
          {readerMode ? null : (
            <button className="primary-button" type="button" onClick={onCreateQuestionnaire} disabled={!canManageContent}>
              Novo formulário
            </button>
          )}
        </div>
      </header>

      {readerMode ? null : (
        <div className="workspace-summary">
          <div className="summary-chip">
            <span>Formulários</span>
            <strong>{metrics.counts.total}</strong>
          </div>
          <div className="summary-chip">
            <span>Respostas</span>
            <strong>{metrics.counts.responses}</strong>
          </div>
          <div className="summary-chip">
            <span>Média</span>
            <strong>{metrics.averageScore.toFixed(1)}</strong>
          </div>
          <div className="summary-chip muted">
            <span>Status</span>
            <strong>{syncStatus ?? 'Online'}</strong>
          </div>
        </div>
      )}

      <div className="table-shell">
        <div className="table-shell-header">
          <div className="table-shell-title">
            <h2>Formulários</h2>
            <span>{rows.length} itens</span>
          </div>
          {readerMode ? null : (
            <button className="ghost-button" type="button" onClick={() => onOpenView('biblioteca')}>
              Abrir lista
            </button>
          )}
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Formulário</th>
                {readerMode ? null : <th>Status</th>}
                <th>Perguntas</th>
                {readerMode ? null : <th>Respostas</th>}
                {readerMode ? null : <th>Média</th>}
                <th>Público</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={readerMode ? 4 : 7}>
                    <div className="empty-state small">Nenhum formulário encontrado.</div>
                  </td>
                </tr>
              ) : (
                rows.map((questionnaire) => {
                  const summary = metrics.summaries.find((item) => item.id === questionnaire.id);
                  return (
                    <tr
                      key={questionnaire.id}
                      className={questionnaire.id === selectedQuestionnaireId ? 'selected' : ''}
                      onClick={() => onSelectQuestionnaire(questionnaire.id)}
                    >
                      <td>
                        <strong>{questionnaire.title}</strong>
                        <span>{questionnaire.domain}</span>
                      </td>
                      {readerMode ? null : (
                        <td>
                          <StatusPill questionnaire={questionnaire} />
                        </td>
                      )}
                      <td>{questionnaire.questions.length}</td>
                      {readerMode ? null : <td>{summary?.relatedCount ?? 0}</td>}
                      {readerMode ? null : <td>{summary?.averageScore ?? '0.0'}</td>}
                      <td>{questionnaire.audience}</td>
                      <td className="table-actions">
                        <button className="icon-button" type="button" onClick={() => onStartQuestionnaire?.(questionnaire.id)}>
                          <Icon name="runner" size={16} />
                        </button>
                        {readerMode ? null : (
                          <button className="icon-button" type="button" onClick={() => onOpenView('construtor')}>
                            <Icon name="builder" size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="workspace-footer">
        <div className="workspace-preview">
          <span className="eyebrow">Selecionado</span>
          {preview ? (
            <>
            <strong>{preview.title}</strong>
              <p>{preview.subtitle}</p>
            </>
          ) : (
            <p>Nenhum formulário selecionado.</p>
          )}
        </div>

        <div className="workspace-footer-actions">
          <button
            className="ghost-button"
            type="button"
            onClick={() => onStartQuestionnaire?.(preview?.id)}
            disabled={!preview}
          >
            Responder
          </button>
          {readerMode ? null : (
            <>
              <button className="ghost-button" type="button" onClick={() => onOpenView('resultados')} disabled={!preview}>
                Resultados
              </button>
              <button className="primary-button" type="button" onClick={onCreateQuestionnaire} disabled={!canManageContent}>
                Criar
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
