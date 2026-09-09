// Admin app — auth gate + shell

const ADM_VIEWS = { listings: "listings", newProp: "newProp", editProp: "editProp", leads: "leads", security: "security" };
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

/* ------ Icons ------ */
const AIcon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const IList   = () => <AIcon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />;
const IPlus   = () => <AIcon d="M12 5v14M5 12h14" />;
const ILogout = () => <AIcon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />;
const IHome   = () => <AIcon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10" />;
const IInbox  = () => <AIcon d="M22 12h-6l-2 3h-4l-2-3H2M5 5h14l3 7v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5z" />;
const IShield = () => <AIcon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;

/* ------ Cloudflare Turnstile ------ */
// Server-side bot protection for the login endpoint. Rendered only when a site
// key is configured and Turnstile is enabled in the Supabase Auth settings.
function useTurnstile(containerRef, enabled) {
  const [token, setToken] = React.useState("");
  const widgetId = React.useRef(null);
  const siteKey = (window.NEW_HOME_CONFIG || {}).turnstileSiteKey || "";

  React.useEffect(() => {
    if (!enabled || !siteKey) return;

    let cancelled = false;
    function render() {
      if (cancelled || !containerRef.current || widgetId.current !== null) return;
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: setToken,
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    }

    if (window.turnstile) {
      render();
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = render;
      document.head.appendChild(script);
    }

    return () => { cancelled = true; };
  }, [enabled, siteKey]);

  const reset = React.useCallback(() => {
    setToken("");
    if (window.turnstile && widgetId.current !== null) window.turnstile.reset(widgetId.current);
  }, []);

  return { token, reset, required: Boolean(siteKey) };
}

/* ------ Login form ------ */
function Login({ notice = "" }) {
  const [email, setEmail]     = React.useState("");
  const [pass, setPass]       = React.useState("");
  const [error, setError]     = React.useState("");
  const [info, setInfo]       = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [attempts, setAttempts] = React.useState(0);
  const [lockout, setLockout]   = React.useState(0); // seconds remaining
  const [mfaFactor, setMfaFactor] = React.useState(null);
  const [mfaCode, setMfaCode]     = React.useState("");
  const captchaRef = React.useRef(null);
  const captcha = useTurnstile(captchaRef, true);

  React.useEffect(() => {
    if (lockout <= 0) return;
    const id = setInterval(() => setLockout(s => {
      if (s <= 1) { clearInterval(id); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [lockout > 0]);

  // Client-side throttling is a courtesy only. The enforced limits are the
  // Supabase Auth rate limits and the Turnstile challenge above.
  const locked = lockout > 0 || attempts >= MAX_ATTEMPTS;

  function registerFailure(message) {
    const next = attempts + 1;
    setAttempts(next);
    captcha.reset();
    if (next >= MAX_ATTEMPTS) {
      setLockout(LOCKOUT_SECONDS);
      setError(`Muitas tentativas. Tente novamente em ${LOCKOUT_SECONDS} segundos.`);
    } else {
      setError(message);
    }
    setPass("");
  }

  async function submit(e) {
    e.preventDefault();
    if (locked) return;
    setLoading(true); setError(""); setInfo("");

    if (!window.sb) {
      setLoading(false);
      setError("Supabase não está configurado. Consulte as instruções de instalação.");
      return;
    }

    if (captcha.required && !captcha.token) {
      setLoading(false);
      setError("Confirme a verificação de segurança antes de entrar.");
      return;
    }

    const options = captcha.token ? { captchaToken: captcha.token } : undefined;
    const { error: err } = await window.sb.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: pass,
      options,
    });

    if (err) {
      setLoading(false);
      registerFailure(`Credenciais inválidas. ${MAX_ATTEMPTS - attempts - 1} tentativa(s) restante(s).`);
      return;
    }

    // A second factor may still be required before the session reaches aal2.
    const { data: aal } = await window.sb.auth.mfa.getAuthenticatorAssuranceLevel();
    setLoading(false);
    if (aal && aal.nextLevel === "aal2" && aal.nextLevel !== aal.currentLevel) {
      const { data: factors } = await window.sb.auth.mfa.listFactors();
      const factor = factors?.totp?.[0];
      if (factor) { setMfaFactor(factor); setAttempts(0); return; }
    }
    setAttempts(0);
  }

  async function submitMfa(e) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error: err } = await window.sb.auth.mfa.challengeAndVerify({
      factorId: mfaFactor.id,
      code: mfaCode.trim(),
    });
    setLoading(false);
    if (err) {
      setMfaCode("");
      setError("Código inválido ou expirado. Tente o código atual do aplicativo.");
      return;
    }
    setMfaFactor(null);
  }

  async function recover() {
    setError(""); setInfo("");
    const address = email.trim().toLowerCase();
    if (!address) { setError("Informe o e-mail para receber o link de redefinição."); return; }
    if (!window.sb) { setError("Supabase não está configurado."); return; }
    await window.sb.auth.resetPasswordForEmail(address, { redirectTo: `${location.origin}/admin` });
    // The same message is shown whether or not the account exists.
    setInfo("Se existir uma conta com esse e-mail, o link de redefinição foi enviado.");
  }

  if (mfaFactor) {
    return (
      <div className="adm-login" role="main">
        <div className="adm-login-card">
          <div className="adm-login-logo">
            <div className="adm-login-wordmark">New Home <em>Imóveis</em></div>
            <div className="adm-login-logo-sub">Verificação em duas etapas</div>
          </div>
          <h1>Código de acesso</h1>
          <p>Digite o código de 6 dígitos do seu aplicativo autenticador.</p>
          <form onSubmit={submitMfa} noValidate>
            <div className="adm-field">
              <label htmlFor="adm-mfa">Código</label>
              <input id="adm-mfa" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                     value={mfaCode} onChange={e => setMfaCode(e.target.value.replace(/\D/g, ""))}
                     required autoFocus disabled={loading} />
            </div>
            {error && <div className="adm-error" role="alert">{error}</div>}
            <button type="submit" className="adm-btn adm-btn-primary"
                    disabled={loading || mfaCode.length < 6} aria-busy={loading}>
              {loading ? "Verificando..." : "Confirmar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-login" role="main">
      <div className="adm-login-card">
        <div className="adm-login-logo">
          <div className="adm-login-wordmark">New Home <em>Imóveis</em></div>
          <div className="adm-login-logo-sub">Painel administrativo</div>
        </div>
        <h1>Entrar</h1>
        <p>Acesso restrito à equipe interna.</p>
        <form onSubmit={submit} noValidate>
          <div className="adm-field">
            <label htmlFor="adm-email">E-mail</label>
            <input
              id="adm-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required autoFocus autoComplete="email"
              disabled={locked || loading}
            />
          </div>
          <div className="adm-field">
            <label htmlFor="adm-pass">Senha</label>
            <input
              id="adm-pass"
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              required autoComplete="current-password"
              disabled={locked || loading}
            />
          </div>
          <div ref={captchaRef} className="adm-captcha" />
          {notice && <div className="adm-error" role="alert">{notice}</div>}
          {error && <div className="adm-error" role="alert">{error}</div>}
          {info && <div className="adm-info" role="status">{info}</div>}
          {lockout > 0 && (
            <div className="adm-error" role="alert" aria-live="polite">
              Bloqueado por {lockout}s
            </div>
          )}
          <button
            type="submit"
            className="adm-btn adm-btn-primary"
            disabled={locked || loading}
            aria-busy={loading}
          >
            {loading ? "Entrando..." : locked && lockout > 0 ? `Aguarde ${lockout}s` : "Entrar"}
          </button>
          <button type="button" className="adm-btn adm-btn-link" onClick={recover} disabled={loading}>
            Esqueci minha senha
          </button>
        </form>
      </div>
    </div>
  );
}

/* ------ Password reset (recovery link) ------ */
function ResetPassword({ onDone }) {
  const [pass, setPass]   = React.useState("");
  const [again, setAgain] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    if (pass.length < 12) { setError("Use pelo menos 12 caracteres."); return; }
    if (pass !== again) { setError("As senhas não coincidem."); return; }
    setSaving(true); setError("");
    const { error: err } = await window.sb.auth.updateUser({ password: pass });
    setSaving(false);
    if (err) { setError("Não foi possível alterar a senha. Solicite um novo link."); return; }
    onDone();
  }

  return (
    <div className="adm-login" role="main">
      <div className="adm-login-card">
        <div className="adm-login-logo">
          <div className="adm-login-wordmark">New Home <em>Imóveis</em></div>
          <div className="adm-login-logo-sub">Redefinir senha</div>
        </div>
        <h1>Nova senha</h1>
        <p>Escolha uma senha longa e exclusiva, com no mínimo 12 caracteres.</p>
        <form onSubmit={submit} noValidate>
          <div className="adm-field">
            <label htmlFor="adm-new">Nova senha</label>
            <input id="adm-new" type="password" value={pass} minLength={12} required autoFocus
                   autoComplete="new-password" onChange={e => setPass(e.target.value)} />
          </div>
          <div className="adm-field">
            <label htmlFor="adm-new2">Repita a senha</label>
            <input id="adm-new2" type="password" value={again} minLength={12} required
                   autoComplete="new-password" onChange={e => setAgain(e.target.value)} />
          </div>
          {error && <div className="adm-error" role="alert">{error}</div>}
          <button type="submit" className="adm-btn adm-btn-primary" disabled={saving} aria-busy={saving}>
            {saving ? "Salvando..." : "Salvar senha"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ------ Security view: TOTP enrolment ------ */
function SecurityView() {
  const [factors, setFactors] = React.useState([]);
  const [enrolling, setEnrolling] = React.useState(null);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function load() {
    const { data } = await window.sb.auth.mfa.listFactors();
    setFactors(data?.totp || []);
  }

  React.useEffect(() => { load(); }, []);

  async function startEnrol() {
    setError(""); setBusy(true);
    const { data, error: err } = await window.sb.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Autenticador ${new Date().toLocaleDateString("pt-BR")}`,
    });
    setBusy(false);
    if (err) { setError("Não foi possível iniciar o cadastro do segundo fator."); return; }
    setEnrolling(data);
  }

  async function confirmEnrol(e) {
    e.preventDefault();
    setBusy(true); setError("");
    const { error: err } = await window.sb.auth.mfa.challengeAndVerify({
      factorId: enrolling.id,
      code: code.trim(),
    });
    setBusy(false);
    if (err) { setError("Código inválido. Verifique o relógio do aparelho e tente o código atual."); return; }
    setEnrolling(null);
    setCode("");
    load();
  }

  async function removeFactor(id) {
    if (!confirm("Remover este segundo fator? A conta voltará a exigir apenas a senha.")) return;
    await window.sb.auth.mfa.unenroll({ factorId: id });
    load();
  }

  const verified = factors.filter(f => f.status === "verified");

  return (
    <>
      <div className="adm-header">
        <div>
          <h1 className="adm-title">Segurança da <em>conta</em></h1>
          <p className="adm-subtitle">Verificação em duas etapas por aplicativo autenticador (TOTP)</p>
        </div>
      </div>

      <div className="adm-card" style={{ padding: 24 }}>
        {error && <div className="adm-error" role="alert">{error}</div>}

        {verified.length === 0 && !enrolling && (
          <>
            <p className="adm-section-label">Nenhum segundo fator ativo</p>
            <p style={{ color: "var(--ink-3)", marginBottom: 16 }}>
              Com apenas a senha, quem obtiver essa credencial controla todas as listagens do site.
              Ative um autenticador (Google Authenticator, 1Password, Aegis) para exigir um segundo código.
            </p>
            <button className="adm-btn adm-btn-primary" onClick={startEnrol} disabled={busy}>
              Ativar verificação em duas etapas
            </button>
          </>
        )}

        {enrolling && (
          <form onSubmit={confirmEnrol}>
            <p className="adm-section-label">Escaneie o código</p>
            <img src={enrolling.totp.qr_code} alt="QR code para o aplicativo autenticador"
                 style={{ width: 200, height: 200, background: "#fff", padding: 8, borderRadius: 8 }} />
            <p style={{ color: "var(--ink-3)", margin: "12px 0", fontSize: 13 }}>
              Não consegue escanear? Digite a chave: <code>{enrolling.totp.secret}</code>
            </p>
            <div className="adm-field" style={{ maxWidth: 220 }}>
              <label htmlFor="adm-enrol">Código do aplicativo</label>
              <input id="adm-enrol" inputMode="numeric" maxLength={6} value={code}
                     onChange={e => setCode(e.target.value.replace(/\D/g, ""))} required />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button type="submit" className="adm-btn adm-btn-primary" disabled={busy || code.length < 6}>
                Confirmar
              </button>
              <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setEnrolling(null)}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {verified.length > 0 && (
          <>
            <p className="adm-section-label">Fatores ativos</p>
            <ul className="adm-factor-list">
              {verified.map(f => (
                <li key={f.id}>
                  <span>{f.friendly_name || "Autenticador"}</span>
                  <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => removeFactor(f.id)}>
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}

/* ------ Sidebar ------ */
function Sidebar({ view, setView, onLogout }) {
  const items = [
    { id: ADM_VIEWS.listings, label: "Imóveis",     icon: <IList /> },
    { id: ADM_VIEWS.newProp,  label: "Novo imóvel", icon: <IPlus /> },
    { id: ADM_VIEWS.leads,    label: "Contatos",    icon: <IInbox /> },
    { id: ADM_VIEWS.security, label: "Segurança",   icon: <IShield /> },
  ];
  return (
    <aside className="adm-sidebar" aria-label="Navegação admin">
      <div className="adm-logo" aria-label="New Home Imóveis">
        <div className="adm-logo-wordmark">New Home <em>Imóveis</em></div>
        <div className="adm-logo-sub">Admin</div>
      </div>
      <nav className="adm-nav" aria-label="Menu principal">
        {items.map(it => (
          <button
            key={it.id}
            className={`adm-nav-item ${view === it.id ? "active" : ""}`}
            onClick={() => setView(it.id)}
            aria-current={view === it.id ? "page" : undefined}
          >
            {it.icon} {it.label}
          </button>
        ))}
        <div className="adm-nav-sep" role="separator" />
        <a className="adm-nav-item" href="index.html" target="_blank" rel="noopener noreferrer">
          <IHome /> Ver site
        </a>
        <button className="adm-nav-item adm-logout" onClick={onLogout} aria-label="Sair da conta">
          <ILogout /> Sair
        </button>
      </nav>
    </aside>
  );
}

/* ------ App shell ------ */
function AdminApp() {
  const [session, setSession]   = React.useState(null);
  const [checking, setChecking] = React.useState(true);
  const [accessError, setAccessError] = React.useState("");
  const [recovery, setRecovery] = React.useState(false);
  const [view, setView]         = React.useState(ADM_VIEWS.listings);
  const [editProp, setEditProp] = React.useState(null);

  React.useEffect(() => {
    if (!window.sb) {
      setAccessError("Configure o Supabase antes de usar o painel.");
      setChecking(false);
      return;
    }

    let active = true;
    async function verify(candidate) {
      if (!active) return;
      if (!candidate) {
        setSession(null);
        setChecking(false);
        return;
      }
      setChecking(true);
      const { data, error } = await window.sb
        .from("admin_users")
        .select("user_id")
        .eq("user_id", candidate.user.id)
        .maybeSingle();
      if (!active) return;
      if (error || !data) {
        setAccessError("Esta conta não tem permissão de administrador.");
        await window.sb.auth.signOut();
        setSession(null);
      } else {
        setAccessError("");
        setSession(candidate);
      }
      setChecking(false);
    }

    window.sb.auth.getSession().then(({ data }) => verify(data.session));
    const { data: { subscription } } = window.sb.auth.onAuthStateChange((event, candidate) => {
      if (event === "PASSWORD_RECOVERY") { setRecovery(true); setChecking(false); return; }
      verify(candidate);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  async function logout() {
    if (!window.sb) return;
    await window.sb.auth.signOut();
    setView(ADM_VIEWS.listings);
    setEditProp(null);
  }

  function handleEdit(prop) {
    setEditProp(prop);
    setView(ADM_VIEWS.editProp);
  }

  function handleSaved() {
    setEditProp(null);
    setView(ADM_VIEWS.listings);
  }

  function handleSetView(v) {
    setEditProp(null);
    setView(v);
  }

  if (recovery) {
    return <ResetPassword onDone={() => { setRecovery(false); history.replaceState(null, "", location.pathname); }} />;
  }

  if (checking) {
    return (
      <div className="adm-loading" role="status" aria-label="Carregando">
        <div className="adm-spinner" />
      </div>
    );
  }

  if (!session) return <Login notice={accessError} />;

  return (
    <div className="adm-shell">
      <Sidebar view={view} setView={handleSetView} onLogout={logout} />
      <main className="adm-main" id="main-content">
        {view === ADM_VIEWS.listings && <ListingsView onEdit={handleEdit} />}
        {view === ADM_VIEWS.newProp  && <PropertyForm onSaved={handleSaved} />}
        {view === ADM_VIEWS.editProp && editProp && <PropertyForm prop={editProp} onSaved={handleSaved} />}
        {view === ADM_VIEWS.leads    && <LeadsView />}
        {view === ADM_VIEWS.security && <SecurityView />}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("admin-root")).render(<AdminApp />);
