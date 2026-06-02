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

function MetricCard({ label, value, hint, icon = 'spark' }) {
  return (
    <article className="metric-card">
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
  onCreateQuestionnaire,
  onOpenView,
  canManageContent = true,
}) {
  const metrics = buildDashboardMetrics(questionnaires, responses);
  const preview =
    metrics.summaries.find((summary) => summary.id === selectedQuestionnaireId) ??
    selectedQuestionnaire ??
    metrics.summaries[0] ??
    null;

  return (
    <section className="dashboard-page">
      <header className="dashboard-topbar">
        <div className="dashboard-intro">
          <span className="eyebrow">Olá, {currentUser?.name?.split(' ')?.[0] ?? 'usuário'}!</span>
          <h1>Um lugar para criar e acompanhar</h1>
          <p>Abra um formulário, envie para as pessoas e veja as respostas em um único fluxo.</p>
        </div>

        <div className="profile-chip">
          <span className="profile-avatar">{getInitials(currentUser?.name)}</span>
          <div>
            <strong>{currentUser?.name ?? 'Sem nome'}</strong>
            <span>{currentUser?.role ?? 'admin'}</span>
          </div>
        </div>
      </header>

      <div className="dashboard-slim-grid">
        <article className="dashboard-card dashboard-hero">
          <div className="card-heading">
            <div>
              <span className="eyebrow">Atalho principal</span>
              <h2>Comece por aqui</h2>
            </div>
          </div>

          <p className="dashboard-hero-copy">
            Crie um formulário, envie o link e acompanhe as respostas sem navegar por telas desnecessárias.
          </p>

          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={onCreateQuestionnaire} disabled={!canManageContent}>
              Novo formulário
            </button>
            <button className="ghost-button" type="button" onClick={() => onOpenView('biblioteca')}>
              Abrir biblioteca
            </button>
            <button className="ghost-button" type="button" onClick={() => onOpenView('resultados')}>
              Ver respostas
            </button>
          </div>

          <div className="hero-metrics">
            <MetricCard label="Formulários" value={metrics.counts.total} hint="Modelos prontos" icon="library" />
            <MetricCard label="Respostas" value={metrics.counts.responses} hint="Envios recebidos" icon="users" />
            <MetricCard label="Média" value={metrics.averageScore.toFixed(1)} hint="Pontuação geral" icon="spark" />
          </div>
        </article>

        <aside className="dashboard-rail">
          <article className="dashboard-card dashboard-compact">
            <div className="card-heading">
              <div>
                <span className="eyebrow">Visão rápida</span>
                <h2>Último formulário</h2>
              </div>
            </div>

            {preview ? (
              <div className="dashboard-mini-copy">
                <strong>{preview.title}</strong>
                <p>{preview.subtitle}</p>
                <div className="preview-meta">
                  <span>{preview.domain}</span>
                  <span>{preview.audience}</span>
                </div>
              </div>
            ) : (
              <div className="empty-state small">Nenhum formulário selecionado.</div>
            )}
          </article>

          <article className="dashboard-card dashboard-compact">
            <div className="card-heading">
              <div>
                <span className="eyebrow">Resumo</span>
                <h2>Uso recente</h2>
              </div>
            </div>

            <div className="simple-list">
              {metrics.summaries.length === 0 ? (
                <div className="empty-state small">Ainda não há formulários cadastrados.</div>
              ) : (
                metrics.summaries.slice(0, 3).map((summary) => (
                  <button
                    key={summary.id}
                    type="button"
                    className="simple-list-item"
                    onClick={() => onOpenView('biblioteca')}
                  >
                    <div>
                      <strong>{summary.title}</strong>
                      <span>{summary.relatedCount} respostas</span>
                    </div>
                    <span>{summary.latestBand}</span>
                  </button>
                ))
              )}
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}
