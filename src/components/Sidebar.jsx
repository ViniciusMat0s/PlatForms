const navigation = [
  { id: 'dashboard', label: 'Painel' },
  { id: 'biblioteca', label: 'Biblioteca' },
  { id: 'construtor', label: 'Construtor' },
  { id: 'responder', label: 'Responder' },
  { id: 'resultados', label: 'Resultados' },
];

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
      <div>
        <div className="brand">
          <span className="brand-mark">F</span>
          <div>
            <strong>Forms Platform</strong>
            <small>Base do projeto</small>
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
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="stat-pill">
          <span>Usuário</span>
          <strong>{currentUser?.name ?? 'Sem sessão'}</strong>
        </div>
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
        <button className="ghost-button" onClick={onLogout} type="button">
          Sair
        </button>
      </div>
    </aside>
  );
}
