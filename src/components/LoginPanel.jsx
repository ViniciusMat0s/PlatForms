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
        <h1>Acesse sua conta</h1>
        <p>Use uma conta de administrador para criar formulários ou uma conta de leitor para responder os questionários.</p>

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
          <strong>Contas de teste</strong>
          <span>admin@local / admin123</span>
          <span>leitor@local / leitor123</span>
        </div>
      </div>
    </section>
  );
}
