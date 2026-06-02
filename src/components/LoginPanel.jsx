import { useState } from 'react';

export default function LoginPanel({ onLogin, loading, error }) {
  const [email, setEmail] = useState('admin@local');
  const [password, setPassword] = useState('admin123');

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin({ email, password });
  };

  return (
    <section className="login-shell">
      <div className="login-card">
        <span className="eyebrow">Acesso restrito</span>
        <h1>Entrar na plataforma</h1>
        <p>
          Use uma conta autorizada para gerenciar questionários, respostas e relatórios.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>E-mail</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? <div className="login-error">{error}</div> : null}

          <button className="primary-button login-button" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-hint">
          <strong>Conta inicial</strong>
          <span>admin@local / admin123</span>
        </div>
      </div>
    </section>
  );
}
