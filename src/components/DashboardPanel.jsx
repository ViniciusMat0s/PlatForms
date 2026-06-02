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
  const topQuestionnaires = metrics.summaries.slice(0, 4);

  return (
    <section className="dashboard-page">
      <header className="dashboard-topbar">
        <div className="dashboard-intro">
          <span className="eyebrow">Olá, {currentUser?.name?.split(' ')?.[0] ?? 'usuário'}!</span>
          <h1>Painel simples</h1>
          <p>Escolha o próximo passo sem precisar pensar muito.</p>
        </div>

        <div className="profile-chip">
          <span className="profile-avatar">{getInitials(currentUser?.name)}</span>
          <div>
            <strong>{currentUser?.name ?? 'Sem nome'}</strong>
            <span>{currentUser?.role ?? 'admin'}</span>
          </div>
        </div>
      </header>

      <div className="dashboard-simple-grid">
        <article className="dashboard-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">Próximo passo</span>
              <h2>Escolha uma ação</h2>
            </div>
          </div>

          <div className="quick-actions">
            <button className="quick-action" type="button" onClick={() => onOpenView('biblioteca')}>
              <Icon name="library" size={22} />
              <span>
                <strong>Ver formulários</strong>
                <small>Escolha um modelo para usar</small>
              </span>
            </button>
            <button className="quick-action" type="button" onClick={() => onOpenView('responder')}>
              <Icon name="runner" size={22} />
              <span>
                <strong>Responder agora</strong>
                <small>Preencher um formulário em andamento</small>
              </span>
            </button>
            <button className="quick-action" type="button" onClick={() => onOpenView('resultados')}>
              <Icon name="results" size={22} />
              <span>
                <strong>Ver resultados</strong>
                <small>Conferir respostas e exportações</small>
              </span>
            </button>
            <button className="quick-action" type="button" onClick={onCreateQuestionnaire} disabled={!canManageContent}>
              <Icon name="builder" size={22} />
              <span>
                <strong>Criar novo</strong>
                <small>Montar um formulário do zero</small>
              </span>
            </button>
          </div>
        </article>

        <article className="dashboard-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">Resumo</span>
              <h2>Visão geral</h2>
            </div>
          </div>

          <div className="summary-list">
            <MetricCard label="Formulários" value={metrics.counts.total} hint="Modelos cadastrados" icon="library" />
            <MetricCard label="Respostas" value={metrics.counts.responses} hint="Registros recebidos" icon="users" />
            <MetricCard label="Média geral" value={metrics.averageScore.toFixed(1)} hint="Pontuação média" icon="spark" />
          </div>
        </article>

        <article className="dashboard-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">Mais usados</span>
              <h2>Formulários em destaque</h2>
            </div>
            <button className="ghost-button" type="button" onClick={() => onOpenView('biblioteca')}>
              Abrir biblioteca
            </button>
          </div>

          <div className="simple-list">
            {topQuestionnaires.length === 0 ? (
              <div className="empty-state small">Ainda não há formulários cadastrados.</div>
            ) : (
              topQuestionnaires.map((summary) => (
                <button
                  key={summary.id}
                  type="button"
                  className="simple-list-item"
                  onClick={() => onOpenView('biblioteca')}
                >
                  <div>
                    <strong>{summary.title}</strong>
                    <span>{summary.domain}</span>
                  </div>
                  <span>{summary.relatedCount} respostas</span>
                </button>
              ))
            )}
          </div>
        </article>

        <article className="dashboard-card dashboard-preview-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">Último selecionado</span>
              <h2>{preview?.title ?? 'Nenhum formulário selecionado'}</h2>
            </div>
            <span className="status-chip">{preview?.status ?? 'rascunho'}</span>
          </div>

          {preview ? (
            <div className="library-detail">
              <p>{preview.subtitle}</p>
              <div className="preview-meta">
                <span>{preview.domain}</span>
                <span>{preview.audience}</span>
                <span>{preview.relatedCount} respostas</span>
              </div>
            </div>
          ) : (
            <div className="empty-state small">Selecione um formulário na biblioteca para ver os detalhes aqui.</div>
          )}
        </article>
      </div>
    </section>
  );
}
