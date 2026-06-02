import Icon from './Icon';
import { buildDashboardMetrics } from '../lib/dashboard';

function formatDate(dateString) {
  if (!dateString) return 'Sem atividade recente';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateString));
}

function getInitials(name) {
  if (!name) return 'FP';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function matchesQuery(summary, query) {
  if (!query) return true;
  const value = query.trim().toLowerCase();
  if (!value) return true;

  return [
    summary.title,
    summary.subtitle,
    summary.domain,
    summary.code,
    summary.audience,
    summary.status,
    ...(summary.tags ?? []),
    ...(summary.questions ?? []).map((question) => question.text),
  ]
    .filter(Boolean)
    .some((item) => String(item).toLowerCase().includes(value));
}

function MetricCard({ label, value, hint, tone = 'blue', icon = 'spark' }) {
  return (
    <article className={`metric-card metric-card-${tone}`}>
      <div className="metric-card-icon">
        <Icon name={icon} size={18} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {hint ? <small>{hint}</small> : null}
      </div>
    </article>
  );
}

export default function DashboardPanel({
  currentUser,
  questionnaires,
  responses,
  selectedQuestionnaire,
  selectedQuestionnaireId,
  query,
  onQueryChange,
  onSelectQuestionnaire,
  onCreateQuestionnaire,
  onOpenView,
  canManageContent = true,
}) {
  const metrics = buildDashboardMetrics(questionnaires, responses);
  const visibleSummaries = metrics.summaries.filter((summary) => matchesQuery(summary, query));
  const current = metrics.summaries.find((summary) => summary.id === selectedQuestionnaireId) ?? metrics.summaries[0];
  const highlight = current ?? selectedQuestionnaire ?? metrics.summaries[0] ?? null;
  const activePct = metrics.counts.total ? Math.round((metrics.counts.active / metrics.counts.total) * 100) : 0;
  const draftPct = metrics.counts.total ? Math.round((metrics.counts.drafts / metrics.counts.total) * 100) : 0;
  const archivedPct = metrics.counts.total ? Math.round((metrics.counts.archived / metrics.counts.total) * 100) : 0;

  return (
    <section className="dashboard-page">
      <header className="dashboard-topbar">
        <div className="dashboard-intro">
          <span className="eyebrow">Welcome back, {currentUser?.name?.split(' ')?.[0] ?? 'Johnson'}!</span>
          <h1>Dashboard</h1>
        </div>

        <div className="topbar-actions">
          <label className="topbar-search">
            <Icon name="search" size={16} />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search questionnaires"
            />
          </label>
          <button className="icon-button" type="button" title="Notifications">
            <Icon name="bell" size={18} />
            <span className="notification-dot" />
          </button>
          <div className="profile-chip">
            <span className="profile-avatar">{getInitials(currentUser?.name)}</span>
            <div>
              <strong>{currentUser?.name ?? 'Johnson Clark'}</strong>
              <span>{currentUser?.role ?? 'admin'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-column dashboard-column-main">
          <article className="dashboard-card dashboard-feature-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">Next Form</span>
                <h2>{highlight?.title ?? 'Nenhum questionário disponível'}</h2>
              </div>
              <button className="ghost-button" type="button" onClick={() => onOpenView('biblioteca')}>
                View Library
              </button>
            </div>

            {highlight ? (
              <>
                <div className="feature-meta">
                  <span>{highlight.domain}</span>
                  <span>{highlight.audience}</span>
                  <span>{highlight.status}</span>
                </div>

                <div className="feature-summary">
                  <div className="feature-score">
                    <span>Última média</span>
                    <strong>{highlight.averageScore}</strong>
                  </div>
                  <div className="feature-copy">
                    <p>{highlight.subtitle}</p>
                    <div className="feature-submeta">
                      <span>{highlight.relatedCount} respostas</span>
                      <span>{highlight.latestBand}</span>
                      <span>{highlight.latestCompletionRate}% concluído</span>
                    </div>
                  </div>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => onOpenView('construtor')}
                    disabled={!canManageContent}
                  >
                    Open Builder
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state small">Ainda não existe nenhum questionário para destacar.</div>
            )}
          </article>

          <article className="dashboard-card dashboard-standings-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">Standings</span>
                <h2>Questionnaires</h2>
              </div>
              <button className="ghost-button" type="button" onClick={() => onOpenView('resultados')}>
                View All
              </button>
            </div>

            <div className="standings-table-wrap">
              <table className="standings-table">
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Questionnaire</th>
                    <th>Resp</th>
                    <th>Avg</th>
                    <th>Band</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSummaries.length === 0 ? (
                    <tr>
                      <td colSpan="6">
                        <div className="empty-state small">Nenhum questionário encontrado com esses termos.</div>
                      </td>
                    </tr>
                  ) : (
                    visibleSummaries.slice(0, 8).map((summary, index) => (
                      <tr
                        key={summary.id}
                        className={summary.id === selectedQuestionnaireId ? 'selected' : ''}
                        onClick={() => onSelectQuestionnaire(summary.id)}
                      >
                        <td>{index + 1}.</td>
                        <td>
                          <strong>{summary.title}</strong>
                          <span>{summary.domain}</span>
                        </td>
                        <td>{summary.relatedCount}</td>
                        <td>{summary.averageScore}</td>
                        <td>{summary.latestBand}</td>
                        <td>
                          <span className={`status-pill status-${summary.status ?? 'draft'}`}>{summary.status ?? 'draft'}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <div className="dashboard-column dashboard-column-side">
          <article className="dashboard-card dashboard-stats-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">Games Statistic</span>
                <h2>Platform Health</h2>
              </div>
              <button className="ghost-button" type="button" onClick={() => onOpenView('resultados')}>
                View Analytics
              </button>
            </div>

            <div className="progress-shell" aria-label="Status distribution">
              <span className="progress-track">
                <span className="progress-active" style={{ width: `${activePct}%` }} />
                <span className="progress-draft" style={{ width: `${draftPct}%` }} />
                <span className="progress-archived" style={{ width: `${archivedPct}%` }} />
              </span>
              <div className="progress-labels">
                <div>
                  <span>Active</span>
                  <strong>{metrics.counts.active}</strong>
                </div>
                <div>
                  <span>Draft</span>
                  <strong>{metrics.counts.drafts}</strong>
                </div>
                <div>
                  <span>Archived</span>
                  <strong>{metrics.counts.archived}</strong>
                </div>
              </div>
            </div>
          </article>

          <div className="mini-metrics-grid">
            <MetricCard
              label="Completion"
              value={`${metrics.averageCompletion}%`}
              hint="Average finished"
              tone="violet"
              icon="target"
            />
            <MetricCard
              label="Average Score"
              value={metrics.averageScore.toFixed(1)}
              hint="All questionnaires"
              tone="pink"
              icon="spark"
            />
            <MetricCard
              label="Coverage"
              value={`${metrics.coverage}%`}
              hint="Forms with responses"
              tone="cyan"
              icon="chart"
            />
            <MetricCard
              label="Responses"
              value={metrics.counts.responses}
              hint={metrics.latestResponse ? formatDate(metrics.latestResponse.createdAt) : 'No activity'}
              tone="blue"
              icon="users"
            />
          </div>

          <article className="dashboard-card dashboard-banner-card">
            <div>
              <span className="eyebrow">Reminder</span>
              <h2>Launch your next questionnaire</h2>
              <p>
                Crie um novo formulário, ajuste a escala e publique sem sair do padrão visual do seu painel.
              </p>
            </div>
            <button className="primary-button" type="button" onClick={onCreateQuestionnaire} disabled={!canManageContent}>
              New Questionnaire
            </button>
            <div className="banner-orb" />
          </article>
        </div>
      </div>
    </section>
  );
}
