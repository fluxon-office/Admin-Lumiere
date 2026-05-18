import { useState } from 'react';
import clinicImage from '../../assets/mulherLumiere.jpg';
import logoImage from '../../assets/logolumiere.jpeg';

function LoginView({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="login-page">
      <section className="login-experience" aria-labelledby="login-title">
        <div className="login-brand-panel">
          <div className="login-brand-topline">
            <img src={logoImage} alt="Lumiere Clinic" />
            <span>Control Room</span>
          </div>

          <div className="login-image-frame">
            <img src={clinicImage} alt="" aria-hidden="true" />
            <div className="login-image-overlay">
              <span className="live-agenda-label">
                <span className="live-dot" aria-hidden="true" />
                Agenda ao vivo
              </span>
              <strong>17 solicitações em acompanhamento</strong>
            </div>
          </div>

          <div className="login-brand-copy">
            <p className="eyebrow">Lumiere Admin</p>
            <h1 id="login-title">Acesso interno para cuidar da rotina da clínica.</h1>
            <p>
              Um painel reservado para organizar agenda, contatos, confirmações e
              remarcações com a mesma precisão do atendimento presencial.
            </p>
          </div>
        </div>

        <aside className="login-panel" aria-label="Formulário de acesso administrativo">
          <div className="login-panel-header">
            <span className="login-status-dot" aria-hidden="true" />
            <span>Ambiente seguro</span>
          </div>

          <div className="login-panel-title">
            <p className="eyebrow">Equipe Lumiere</p>
            <h2>Entrar no painel</h2>
            <p>Use suas credenciais internas para continuar.</p>
          </div>

          <form className="login-form" onSubmit={onLogin}>
            <label>
              E-mail corporativo
              <input type="email" defaultValue="admin@lumiereclinic.com" autoComplete="email" />
            </label>
            <label>
              Senha
              <span className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  defaultValue="lumiere123"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword((current) => !current)}>
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </span>
            </label>

            <div className="login-options">
              <label>
                <input type="checkbox" defaultChecked />
                Manter sessão
              </label>
              <a href="#recuperar">Recuperar acesso</a>
            </div>

            <button type="submit">Acessar agenda</button>
          </form>
        </aside>
      </section>
    </main>
  );
}

export default LoginView;
