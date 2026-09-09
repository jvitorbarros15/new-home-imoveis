// Admin — contact requests and conversion counters

const LEADS_PAGE_SIZE = 25;

function LeadsView() {
  const [leads, setLeads]     = React.useState([]);
  const [counts, setCounts]   = React.useState([]);
  const [total, setTotal]     = React.useState(0);
  const [page, setPage]       = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState("");

  async function load() {
    setLoading(true); setError("");
    const from = (page - 1) * LEADS_PAGE_SIZE;
    const { data, error: err, count } = await window.sb
      .from("leads")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + LEADS_PAGE_SIZE - 1);
    if (err) { setError("Erro ao carregar contatos."); setLoading(false); return; }
    setLeads(data || []);
    setTotal(count || 0);
    setLoading(false);
  }

  async function loadCounts() {
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const { data } = await window.sb
      .from("events")
      .select("name")
      .gte("created_at", since)
      .limit(5000);
    if (!data) return;
    const tally = data.reduce((acc, row) => {
      acc[row.name] = (acc[row.name] || 0) + 1;
      return acc;
    }, {});
    setCounts(Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 6));
  }

  React.useEffect(() => { load(); }, [page]);
  React.useEffect(() => { loadCounts(); }, []);

  async function remove(id, name) {
    if (!confirm(`Excluir o contato de ${name}? Esta ação é permanente.`)) return;
    const { error: err } = await window.sb.from("leads").delete().eq("id", id);
    if (err) { alert("Não foi possível excluir. Tente novamente."); return; }
    setLeads(list => list.filter(l => l.id !== id));
    setTotal(t => Math.max(0, t - 1));
  }

  const pages = Math.max(1, Math.ceil(total / LEADS_PAGE_SIZE));
  const EVENT_LABELS = {
    property_view: "Fichas abertas",
    whatsapp_click: "Cliques no WhatsApp",
    listing_click: "Cliques em listagens",
    lead_submit: "Formulários enviados",
    favorite_add: "Favoritos salvos",
    favorite_remove: "Favoritos removidos",
  };

  return (
    <>
      <div className="adm-header">
        <div>
          <h1 className="adm-title">Contatos <em>recebidos</em></h1>
          <p className="adm-subtitle">
            {loading ? "Carregando..." : `${total} contato${total === 1 ? "" : "s"} registrado${total === 1 ? "" : "s"}`}
          </p>
        </div>
        <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={load} aria-label="Recarregar contatos">
          Atualizar
        </button>
      </div>

      {counts.length > 0 && (
        <div className="adm-metrics" aria-label="Eventos dos últimos 30 dias">
          {counts.map(([name, value]) => (
            <div key={name} className="adm-metric">
              <span className="adm-metric-value">{value}</span>
              <span className="adm-metric-label">{EVENT_LABELS[name] || name}</span>
            </div>
          ))}
        </div>
      )}

      {error && <div className="adm-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="adm-card">
        {loading ? (
          <div className="adm-loading" role="status" aria-label="Carregando contatos">
            <div className="adm-spinner" />
          </div>
        ) : leads.length === 0 ? (
          <div className="adm-empty">
            <h3>Nenhum contato ainda</h3>
            <p>Os envios do formulário do site aparecem aqui.</p>
          </div>
        ) : (
          <table className="adm-table" aria-label="Contatos recebidos">
            <thead>
              <tr>
                <th scope="col">Recebido</th>
                <th scope="col">Nome</th>
                <th scope="col">Contato</th>
                <th scope="col">Interesse</th>
                <th scope="col">Origem</th>
                <th scope="col"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id}>
                  <td style={{ whiteSpace: "nowrap", color: "var(--ink-3)" }}>
                    {new Date(lead.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td>{lead.name}</td>
                  <td>
                    <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                      {lead.phone}
                    </a>
                    <br />
                    <a href={`mailto:${lead.email}`}>{lead.email}</a>
                  </td>
                  <td>{lead.interest || "—"}</td>
                  <td style={{ color: "var(--ink-3)" }}>{lead.source_path || "—"}</td>
                  <td>
                    <button className="adm-btn adm-btn-danger adm-btn-sm"
                            onClick={() => remove(lead.id, lead.name)}
                            aria-label={`Excluir contato de ${lead.name}`}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <nav className="adm-pager" aria-label="Paginação de contatos">
          <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}>Anterior</button>
          <span>Página {page} de {pages}</span>
          <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={page >= pages}
                  onClick={() => setPage(p => p + 1)}>Próxima</button>
        </nav>
      )}
    </>
  );
}
