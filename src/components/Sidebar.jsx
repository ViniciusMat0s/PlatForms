import Icon from './Icon';

const navigation = [
  { id: 'dashboard', label: 'Visão geral', icon: 'dashboard' },
  { id: 'biblioteca', label: 'Formulários', icon: 'library' },
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

export default function Sidebar({ activeView, onChangeView, currentUser, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand brand-compact">
          <span className="brand-mark">FP</span>
          <div>
            <strong>Forms Platform</strong>
            <small>Espaço simples de trabalho</small>
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

        <button className="ghost-button logout-button" onClick={onLogout} type="button">
          <Icon name="logout" size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
