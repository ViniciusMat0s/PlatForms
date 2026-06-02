import Icon from './Icon';

const navigation = [
  { id: 'dashboard', label: 'Visao geral', icon: 'dashboard' },
  { id: 'biblioteca', label: 'Formularios', icon: 'library' },
  { id: 'responder', label: 'Responder', icon: 'runner' },
  { id: 'resultados', label: 'Respostas', icon: 'results' },
];

function getInitials(name) {
  if (!name) return 'FP';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function Sidebar({
  activeView,
  onChangeView,
  currentUser,
  onLogout,
  searchQuery = '',
  onSearchChange = () => {},
  questionnaires = [],
  selectedQuestionnaireId,
  onSelectQuestionnaire = () => {},
}) {
  const recentQuestionnaires = questionnaires.slice(0, 3);

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand">
          <span className="brand-mark">FP</span>
          <div>
            <strong>Forms Platform</strong>
            <small>Simple workspace</small>
          </div>
        </div>

        <label className="sidebar-search">
          <Icon name="search" size={16} />
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Pesquisa rapida..."
          />
          <span className="sidebar-shortcut">Ctrl K</span>
        </label>

        <div className="sidebar-section">
          <span className="sidebar-section-title">Navegacao</span>
          <nav className="nav">
            {navigation.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => onChangeView(item.id)}
                type="button"
              >
                <span className="nav-icon">
                  <Icon name={item.icon} size={16} />
                </span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-section-title">Recentes</span>
          <div className="sidebar-recent-list">
            {recentQuestionnaires.length === 0 ? (
              <div className="sidebar-empty">Nenhum formulario recente.</div>
            ) : (
              recentQuestionnaires.map((questionnaire) => (
                <button
                  key={questionnaire.id}
                  type="button"
                  className={`sidebar-recent-item ${selectedQuestionnaireId === questionnaire.id ? 'active' : ''}`}
                  onClick={() => {
                    onSelectQuestionnaire(questionnaire.id);
                    onChangeView('dashboard');
                  }}
                >
                  <div>
                    <strong>{questionnaire.title}</strong>
                    <span>{questionnaire.domain}</span>
                  </div>
                  <Icon name="chart" size={14} />
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="profile-panel">
          <span className="profile-avatar">{getInitials(currentUser?.name)}</span>
          <div>
            <strong>{currentUser ? currentUser.name : 'Sem sessao'}</strong>
            <span>{currentUser ? currentUser.role : 'Desconectado'}</span>
          </div>
        </div>

        <button className="ghost-button logout-button" onClick={onLogout} type="button">
          <Icon name="logout" size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
