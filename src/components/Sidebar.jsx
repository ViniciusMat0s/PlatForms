import Icon from './Icon';

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'biblioteca', label: 'Biblioteca', icon: 'library' },
  { id: 'construtor', label: 'Construtor', icon: 'builder' },
  { id: 'responder', label: 'Responder', icon: 'runner' },
  { id: 'resultados', label: 'Resultados', icon: 'results' },
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
  questionnaireCount,
  responseCount,
  syncStatus,
  currentUser,
  onLogout,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand">
          <span className="brand-mark">FP</span>
          <div>
            <strong>Forms Platform</strong>
            <small>Questionários e relatórios</small>
          </div>
        </div>

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

      <div className="sidebar-footer">
        <div className="profile-panel">
          <span className="profile-avatar">{getInitials(currentUser?.name)}</span>
          <div>
            <strong>{currentUser ? currentUser.name : 'Sem sessão'}</strong>
            <span>{currentUser ? currentUser.role : 'Desconectado'}</span>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-pill">
            <span>Questionários</span>
            <strong>{questionnaireCount}</strong>
          </div>
          <div className="stat-pill">
            <span>Respostas</span>
            <strong>{responseCount}</strong>
          </div>
          <div className="stat-pill">
            <span>Sincronização</span>
            <strong>{syncStatus}</strong>
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
