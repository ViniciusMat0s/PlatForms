import Icon from './Icon';

const navigation = [
  { id: 'dashboard', label: 'Painel', icon: 'dashboard' },
  { id: 'biblioteca', label: 'Biblioteca', icon: 'library' },
  { id: 'responder', label: 'Responder', icon: 'runner' },
  { id: 'resultados', label: 'Resultados', icon: 'results' },
];

const flowOrder = ['dashboard', 'biblioteca', 'responder', 'resultados'];

function getInitials(name) {
  if (!name) return 'FP';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function getNextView(activeView) {
  const index = flowOrder.indexOf(activeView);
  if (index < 0 || index === flowOrder.length - 1) return flowOrder[0];
  return flowOrder[index + 1];
}

export default function Sidebar({ activeView, onChangeView, currentUser, onLogout }) {
  const nextView = getNextView(activeView);
  const nextLabel = navigation.find((item) => item.id === nextView)?.label ?? 'Painel';

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand">
          <span className="brand-mark">FP</span>
          <div>
            <strong>Forms Platform</strong>
            <small>Fluxo simples e guiado</small>
          </div>
        </div>

        <div className="step-card">
          <span className="eyebrow">Próximo passo</span>
          <strong>{nextLabel}</strong>
          <p>{activeView === 'dashboard' ? 'Comece pela biblioteca para escolher um formulário.' : 'Use o próximo passo para continuar.'}</p>
          <button className="primary-button step-button" type="button" onClick={() => onChangeView(nextView)}>
            Continuar
          </button>
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
