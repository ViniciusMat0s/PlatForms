import { useState } from 'react';

export default function LoginPanel({ onLogin, onPublicAccess, loading, error }) {
  const [email, setEmail] = useState('ronice');
  const [password, setPassword] = useState('roniceadmin');
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');

  const handleAdminSubmit = (event) => {
    event.preventDefault();
    onLogin({ email, password });
  };

  const handlePublicSubmit = (event) => {
    event.preventDefault();
    onPublicAccess?.({ name, sector });
  };

  return (
    <section className="login-shell">
      <div className="login-grid">
        <article className="login-card">
          <span className="eyebrow">Acesso do administrador</span>
          <h1>Entrar para gerenciar os formulários</h1>
          <p>Use sua conta de administrador para criar, acompanhar e exportar os resultados.</p>

          <form className="login-form" onSubmit={handleAdminSubmit}>
            <label className="field">
              <span>Login</span>
              <input required value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="field">
              <span>Senha</span>
              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error ? <div className="login-error">{error}</div> : null}

            <button className="primary-button login-button" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar como administrador'}
            </button>
          </form>
        </article>

        <article className="login-card login-card-soft">
          <span className="eyebrow">Acesso livre</span>
          <h1>Responder sem login</h1>
          <p>Qualquer pessoa pode responder informando o nome e o setor antes de abrir os formulários.</p>

          <form className="login-form" onSubmit={handlePublicSubmit}>
            <label className="field">
              <span>Nome</span>
              <input required value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="field">
              <span>Setor</span>
              <input required value={sector} onChange={(event) => setSector(event.target.value)} />
            </label>

            <button className="ghost-button login-button" type="submit">
              Continuar para responder
            </button>
          </form>

          <div className="login-hint">
            <strong>Administrador de teste</strong>
            <span>ronice / roniceadmin</span>
          </div>
        </article>
      </div>
    </section>
  );
}
