import { useState } from 'react';
import logoImage from '../../assets/logolumiere.jpeg';
import { formatPhone } from '../../utils/contactUtils';

const recoveryInitialState = {
  code: '',
  confirmPassword: '',
  email: '',
  password: '',
};

const firstAccessInitialState = {
  businessAddress: '',
  businessDocument: '',
  businessEmail: '',
  businessName: '',
  businessPhone: '',
  confirmPassword: '',
  ownerEmail: '',
  ownerName: '',
  ownerPhone: '',
  password: '',
};

const panelCopy = {
  login: {
    eyebrow: 'Equipe Lumiere',
    title: 'Entrar no painel',
    description: 'Use suas credenciais internas para continuar.',
  },
  recover: {
    eyebrow: 'Recuperar acesso',
    title: 'Redefinir senha',
  },
  firstAccess: {
    eyebrow: 'Primeiro acesso',
    title: 'Cadastrar negocio',
    description: 'Preencha os dados iniciais da empresa e do responsavel administrativo.',
  },
};

function LoginView({
  error,
  loading,
  notice,
  onBootstrap,
  onLogin,
  onPasswordReset,
  onRecoveryCodeRequest,
  onTemporaryAccess,
  recoveryCodeSent,
}) {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('admin@lumiereclinic.com');
  const [senha, setSenha] = useState('');
  const [recoveryForm, setRecoveryForm] = useState(recoveryInitialState);
  const [firstAccessForm, setFirstAccessForm] = useState(firstAccessInitialState);

  const currentCopy = panelCopy[mode];
  const recoveryDescription = recoveryCodeSent
    ? 'Informe o codigo recebido e cadastre uma nova senha.'
    : 'Digite seu e-mail para receber um codigo de verificacao.';

  function changeMode(nextMode) {
    setMode(nextMode);
    setShowPassword(false);
  }

  function submitLogin(event) {
    event.preventDefault();
    onLogin({ email, senha });
  }

  function updateRecoveryForm(field, value) {
    setRecoveryForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateFirstAccessForm(field, value) {
    setFirstAccessForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function submitRecoveryEmail(event) {
    event.preventDefault();
    onRecoveryCodeRequest(recoveryForm.email);
  }

  async function submitPasswordReset(event) {
    event.preventDefault();
    const resetCompleted = await onPasswordReset(recoveryForm);

    if (resetCompleted) {
      setMode('login');
      setSenha('');
      setShowPassword(false);
      setRecoveryForm(recoveryInitialState);
    }
  }

  function submitFirstAccess(event) {
    event.preventDefault();
    onBootstrap(firstAccessForm);
  }

  return (
    <main className="login-page">
      <section className={`login-experience ${mode === 'firstAccess' ? 'is-first-access' : ''}`} aria-labelledby="login-title">
        <div className="login-brand-panel">
          <div className="login-brand-topline">
            <span>Control Room</span>
          </div>

          <div className="login-image-frame">
            <img src={logoImage} alt="Lumiere Clinic" />
            <div className="login-image-overlay">
              <span className="live-agenda-label">
                <span className="live-dot" aria-hidden="true" />
                Agenda ao vivo
              </span>
              <strong>17 solicitacoes em acompanhamento</strong>
            </div>
          </div>

          <div className="login-brand-copy">
            <p className="eyebrow">Lumiere Admin</p>
            <h1 id="login-title">Acesso interno para cuidar da rotina da clinica.</h1>
            <p>
              Um painel reservado para organizar agenda, contatos, confirmacoes e
              remarcacoes com a mesma precisao do atendimento presencial.
            </p>
          </div>
        </div>

        <aside className="login-panel" aria-label="Formulario de acesso administrativo">
          <div className="login-panel-header">
            <span className="login-status-dot" aria-hidden="true" />
            <span>Ambiente seguro</span>
          </div>

          <div className="login-panel-title">
            <p className="eyebrow">{currentCopy.eyebrow}</p>
            <h2>{currentCopy.title}</h2>
            <p>{mode === 'recover' ? recoveryDescription : currentCopy.description}</p>
          </div>

          {mode === 'login' ? (
            <form className="login-form" onSubmit={submitLogin}>
              <label>
                E-mail corporativo
                <input
                  required
                  type="email"
                  value={email}
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label>
                Senha
                <span className="password-field">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={senha}
                    autoComplete="current-password"
                    onChange={(event) => setSenha(event.target.value)}
                  />
                  <button type="button" onClick={() => setShowPassword((current) => !current)}>
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </button>
                </span>
              </label>

              <div className="login-options">
                <label>
                  <input type="checkbox" defaultChecked />
                  Manter sessao
                </label>
                <button type="button" onClick={() => changeMode('recover')}>
                  Recuperar acesso
                </button>
              </div>

              {notice ? <div className="login-notice" role="status">{notice}</div> : null}
              {error ? <div className="login-error" role="alert">{error}</div> : null}

              <button disabled={loading} type="submit">
                {loading ? 'Validando...' : 'Acessar agenda'}
              </button>
              <button className="secondary-login-action" disabled={loading} type="button" onClick={() => changeMode('firstAccess')}>
                Criar primeiro acesso
              </button>
              <button className="temporary-login-action" disabled={loading} type="button" onClick={onTemporaryAccess}>
                Acessar dashboard temporariamente
              </button>
            </form>
          ) : null}

          {mode === 'recover' ? (
            <form className="login-form" onSubmit={recoveryCodeSent ? submitPasswordReset : submitRecoveryEmail}>
              <label>
                E-mail cadastrado
                <input
                  required
                  type="email"
                  value={recoveryForm.email}
                  autoComplete="email"
                  onChange={(event) => updateRecoveryForm('email', event.target.value)}
                />
              </label>

              {recoveryCodeSent ? (
                <>
                  <label>
                    Codigo recebido
                    <input
                      required
                      inputMode="numeric"
                      minLength="6"
                      maxLength="6"
                      value={recoveryForm.code}
                      autoComplete="one-time-code"
                      onChange={(event) => updateRecoveryForm('code', event.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                  </label>
                  <label>
                    Nova senha
                    <input
                      required
                      minLength="6"
                      type="password"
                      value={recoveryForm.password}
                      autoComplete="new-password"
                      onChange={(event) => updateRecoveryForm('password', event.target.value)}
                    />
                  </label>
                  <label>
                    Confirmar nova senha
                    <input
                      required
                      minLength="6"
                      type="password"
                      value={recoveryForm.confirmPassword}
                      autoComplete="new-password"
                      onChange={(event) => updateRecoveryForm('confirmPassword', event.target.value)}
                    />
                  </label>
                </>
              ) : null}

              {notice ? <div className="login-notice" role="status">{notice}</div> : null}
              {error ? <div className="login-error" role="alert">{error}</div> : null}

              <button disabled={loading} type="submit">
                {loading ? 'Processando...' : recoveryCodeSent ? 'Confirmar nova senha' : 'Enviar codigo'}
              </button>
              <button className="secondary-login-action" disabled={loading} type="button" onClick={() => changeMode('login')}>
                Voltar para login
              </button>
            </form>
          ) : null}

          {mode === 'firstAccess' ? (
            <form className="login-form first-access-form" onSubmit={submitFirstAccess}>
              <div className="form-section-title">Dados do negocio</div>
              <label>
                Nome do negocio
                <input
                  required
                  value={firstAccessForm.businessName}
                  autoComplete="organization"
                  onChange={(event) => updateFirstAccessForm('businessName', event.target.value)}
                />
              </label>
              <div className="login-form-row">
                <label>
                  CNPJ
                  <input
                    required
                    value={firstAccessForm.businessDocument}
                    inputMode="numeric"
                    onChange={(event) => updateFirstAccessForm('businessDocument', event.target.value)}
                  />
                </label>
                <label>
                  Telefone
                  <input
                    required
                    value={firstAccessForm.businessPhone}
                    inputMode="tel"
                    autoComplete="tel"
                    onChange={(event) => updateFirstAccessForm('businessPhone', formatPhone(event.target.value))}
                  />
                </label>
              </div>
              <label>
                E-mail do negocio
                <input
                  required
                  type="email"
                  value={firstAccessForm.businessEmail}
                  autoComplete="email"
                  onChange={(event) => updateFirstAccessForm('businessEmail', event.target.value)}
                />
              </label>
              <label>
                Endereco
                <input
                  required
                  value={firstAccessForm.businessAddress}
                  autoComplete="street-address"
                  onChange={(event) => updateFirstAccessForm('businessAddress', event.target.value)}
                />
              </label>

              <div className="form-section-title">Responsavel administrativo</div>
              <label>
                Nome completo
                <input
                  required
                  value={firstAccessForm.ownerName}
                  autoComplete="name"
                  onChange={(event) => updateFirstAccessForm('ownerName', event.target.value)}
                />
              </label>
              <div className="login-form-row">
                <label>
                  E-mail de acesso
                  <input
                    required
                    type="email"
                    value={firstAccessForm.ownerEmail}
                    autoComplete="email"
                    onChange={(event) => updateFirstAccessForm('ownerEmail', event.target.value)}
                  />
                </label>
                <label>
                  Telefone
                  <input
                    required
                    value={firstAccessForm.ownerPhone}
                    inputMode="tel"
                    autoComplete="tel"
                    onChange={(event) => updateFirstAccessForm('ownerPhone', formatPhone(event.target.value))}
                  />
                </label>
              </div>
              <div className="login-form-row">
                <label>
                  Senha
                  <input
                    required
                    minLength="6"
                    type="password"
                    value={firstAccessForm.password}
                    autoComplete="new-password"
                    onChange={(event) => updateFirstAccessForm('password', event.target.value)}
                  />
                </label>
                <label>
                  Confirmar senha
                  <input
                    required
                    minLength="6"
                    type="password"
                    value={firstAccessForm.confirmPassword}
                    autoComplete="new-password"
                    onChange={(event) => updateFirstAccessForm('confirmPassword', event.target.value)}
                  />
                </label>
              </div>

              {notice ? <div className="login-notice" role="status">{notice}</div> : null}
              {error ? <div className="login-error" role="alert">{error}</div> : null}

              <button disabled={loading} type="submit">
                {loading ? 'Criando acesso...' : 'Cadastrar e entrar'}
              </button>
              <button className="secondary-login-action" disabled={loading} type="button" onClick={() => changeMode('login')}>
                Voltar para login
              </button>
            </form>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

export default LoginView;
