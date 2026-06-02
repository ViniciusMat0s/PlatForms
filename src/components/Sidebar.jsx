import Icon from './Icon';

const adminNavigation = [
  { id: 'dashboard', label: 'Visão geral', icon: 'dashboard' },
  { id: 'biblioteca', label: 'Formulários', icon: 'library' },
  { id: 'responder', label: 'Responder', icon: 'runner' },
  { id: 'resultados', label: 'Respostas', icon: 'results' },
];

const readerNavigation = [{ id: 'biblioteca', label: 'Formulários', icon: 'library' }];

function getInitials(name) {
  if (!name) return 'FP';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function getRoleLabel(role) {
  if (role === 'admin') return 'Administrador';
  if (role === 'leitor') return 'Leitor';
  return 'Convidado';
}

export default function Sidebar({ activeView, onChangeView, currentUser, onLogout }) {
  const navigation = currentUser?.role === 'admin' ? adminNavigation : readerNavigation;
  const roleLabel = currentUser ? getRoleLabel(currentUser.role) : 'Desconectado';

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
          <div className="profile-copy">
            <strong>{currentUser ? currentUser.name : 'Sem sessão'}</strong>
            <span>{roleLabel}</span>
          </div>
          <span className="profile-avatar">{getInitials(currentUser?.name)}</span>
        </div>

        <button className="ghost-button logout-button" onClick={onLogout} type="button">
          <Icon name="logout" size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
