// Admin app — auth gate + shell

const ADM_VIEWS = { listings: "listings", newProp: "newProp", editProp: "editProp" };
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

/* ------ Login form ------ */
function Login({ notice = "" }) {
  const [email, setEmail]     = React.useState("");
  const [pass, setPass]       = React.useState("");
  const [error, setError]     = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [attempts, setAttempts] = React.useState(0);
  const [lockout, setLockout]   = React.useState(0); // seconds remaining

  React.useEffect(() => {
    if (lockout <= 0) return;
    const id = setInterval(() => setLockout(s => {
      if (s <= 1) { clearInterval(id); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [lockout > 0]);

  const locked = lockout > 0 || attempts >= MAX_ATTEMPTS;

  async function submit(e) {
    e.preventDefault();
    if (locked) return;
    setLoading(true); setError("");

    if (!window.sb) {
      setLoading(false);
      setError("Supabase não está configurado. Consulte as instruções de instalação.");
      return;
    }

    const { error: err } = await window.sb.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: pass,
    });

    setLoading(false);

    if (err) {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        setLockout(LOCKOUT_SECONDS);
        setError(`Muitas tentativas. Tente novamente em ${LOCKOUT_SECONDS} segundos.`);
      } else {
        setError(`Credenciais inválidas. ${MAX_ATTEMPTS - next} tentativa${MAX_ATTEMPTS - next !== 1 ? "s" : ""} restante${MAX_ATTEMPTS - next !== 1 ? "s" : ""}.`);
      }
      setPass("");
      return;
    }

    setAttempts(0);
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
          {notice && <div className="adm-error" role="alert">{notice}</div>}
          {error && <div className="adm-error" role="alert">{error}</div>}
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
        </form>
      </div>
    </div>
  );
}

/* ------ Sidebar ------ */
function Sidebar({ view, setView, onLogout }) {
  const items = [
    { id: ADM_VIEWS.listings, label: "Imóveis",     icon: <IList /> },
    { id: ADM_VIEWS.newProp,  label: "Novo imóvel", icon: <IPlus /> },
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
    const { data: { subscription } } = window.sb.auth.onAuthStateChange((_event, candidate) => {
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
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("admin-root")).render(<AdminApp />);
