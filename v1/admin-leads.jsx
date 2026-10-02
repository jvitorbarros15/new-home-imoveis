// Admin — contact requests and conversion counters

const LEADS_PAGE_SIZE = 100;
const LEAD_KINDS = { contact: "Contato", visit: "Visita", seller: "Proprietário" };
const LEAD_STATUSES = { novo: "Novo", contatado: "Contatado", visita: "Visita", fechado: "Fechado", perdido: "Perdido" };
const MISSING_COLUMN_CODES = ["42703", "PGRST204"];

function csvCell(value) {
  let text = value == null ? "" : String(value);
  // Spreadsheets run cells that start with these characters as formulas; plain phone numbers are exempt.
  if (/^[=+\-@\t\r]/.test(text) && !/^\+\d+$/.test(text)) text = `'${text}`;
  return /[",;\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function leadsToCsv(rows) {
  const header = ["Recebido", "Tipo", "Nome", "Telefone", "E-mail", "Imóvel", "Interesse", "Mensagem", "Origem", "Página", "Referência", "Status"];
  const lines = rows.map(lead => [
    new Date(lead.created_at).toLocaleString("pt-BR"),
    LEAD_KINDS[lead.kind] || lead.kind,
    lead.name,
    lead.phone,
    lead.email,
    lead.property_code,
    lead.interest,
    lead.message,
    [lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / "),
    lead.source_path,
    lead.referrer,
    lead.status ? LEAD_STATUSES[lead.status] || lead.status : "",
  ].map(csvCell).join(";"));
  return "﻿" + [header.map(csvCell).join(";"), ...lines].join("\r\n");
}

function LeadsView() {
  const [leads, setLeads]     = React.useState([]);
  const [counts, setCounts]   = React.useState([]);
  const [total, setTotal]     = React.useState(0);
  const [page, setPage]       = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState("");
  const [kindFilter, setKindFilter] = React.useState("");
  const [search, setSearch]   = React.useState("");
  const [statusUnavailable, setStatusUnavailable] = React.useState(false);

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

  async function changeStatus(lead, status) {
    const previous = lead.status;
    setLeads(list => list.map(l => l.id === lead.id ? { ...l, status } : l));
    const { error: err } = await window.sb.from("leads").update({ status }).eq("id", lead.id);
    if (!err) return;
    setLeads(list => list.map(l => l.id === lead.id ? { ...l, status: previous } : l));
    if (MISSING_COLUMN_CODES.includes(err.code)) setStatusUnavailable(true);
    else alert("Não foi possível atualizar o status. Tente novamente.");
  }

  async function remove(id, name) {
    if (!confirm(`Excluir o contato de ${name}? Esta ação é permanente.`)) return;
    const { error: err } = await window.sb.from("leads").delete().eq("id", id);
    if (err) { alert("Não foi possível excluir. Tente novamente."); return; }
    setLeads(list => list.filter(l => l.id !== id));
    setTotal(t => Math.max(0, t - 1));
  }

  const pages = Math.max(1, Math.ceil(total / LEADS_PAGE_SIZE));
  const term = search.trim().toLocaleLowerCase("pt-BR");
  const visible = leads.filter(lead =>
    (!kindFilter || lead.kind === kindFilter) &&
    (!term || [lead.name, lead.phone, lead.email, lead.property_code].some(v => (v || "").toLocaleLowerCase("pt-BR").includes(term)))
  );
  const hasStatus = !statusUnavailable && leads.length > 0 && "status" in leads[0];

  function exportCsv() {
    const blob = new Blob([leadsToCsv(visible)], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `contatos-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

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
        <>
          <p className="adm-metrics-title">Eventos (últimos 30 dias, até 5.000)</p>
          <div className="adm-metrics" aria-label="Eventos (últimos 30 dias, até 5.000)">
            {counts.map(([name, value]) => (
              <div key={name} className="adm-metric">
                <span className="adm-metric-value">{value}</span>
                <span className="adm-metric-label">{EVENT_LABELS[name] || name}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="adm-filters">
        <div className="adm-field">
          <label htmlFor="lead-kind">Tipo</label>
          <select id="lead-kind" value={kindFilter} onChange={e => setKindFilter(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(LEAD_KINDS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="adm-field">
          <label htmlFor="lead-search">Buscar</label>
          <input id="lead-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Nome, telefone, e-mail ou código" />
        </div>
        <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={exportCsv} disabled={visible.length === 0}>
          Exportar CSV
        </button>
      </div>

      {error && <div className="adm-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="adm-card">
        {loading ? (
          <div className="adm-loading" role="status" aria-label="Carregando contatos">
            <div className="adm-spinner" />
          </div>
        ) : visible.length === 0 ? (
          <div className="adm-empty">
            <h3>{leads.length === 0 ? "Nenhum contato ainda" : "Nenhum contato encontrado"}</h3>
            <p>{leads.length === 0 ? "Os envios do formulário do site aparecem aqui." : "Ajuste o tipo ou a busca."}</p>
          </div>
        ) : (
          <table className="adm-table" aria-label="Contatos recebidos">
            <thead>
              <tr>
                <th scope="col">Recebido</th>
                <th scope="col">Tipo</th>
                <th scope="col">Nome</th>
                <th scope="col">Contato</th>
                <th scope="col">Imóvel</th>
                <th scope="col">Mensagem</th>
                <th scope="col">Origem</th>
                {hasStatus && <th scope="col">Status</th>}
                <th scope="col"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(lead => (
                <tr key={lead.id}>
                  <td style={{ whiteSpace: "nowrap", color: "var(--ink-3)" }}>
                    {new Date(lead.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td><span className={`adm-badge adm-badge-lead-${lead.kind}`}>{LEAD_KINDS[lead.kind] || lead.kind}</span></td>
                  <td>{lead.name}</td>
                  <td>
                    <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                      {lead.phone}
                    </a>
                    {lead.email && <><br /><a href={`mailto:${encodeURIComponent(lead.email)}`}>{lead.email}</a></>}
                  </td>
                  <td>
                    {lead.property_code
                      ? <a href={`/imovel?code=${encodeURIComponent(lead.property_code)}`} target="_blank" rel="noopener noreferrer">{lead.property_code}</a>
                      : "—"}
                    {lead.interest && <div className="adm-lead-note">{lead.interest}</div>}
                  </td>
                  <td className="adm-lead-msg">{lead.message || "—"}</td>
                  <td className="adm-lead-note">
                    {lead.source_path || "—"}
                    {(lead.utm_source || lead.utm_medium) && <div>{[lead.utm_source, lead.utm_medium].filter(Boolean).join(" / ")}</div>}
                    {lead.referrer && <div title={lead.referrer}>{lead.referrer.replace(/^https?:\/\//, "").slice(0, 40)}</div>}
                  </td>
                  {hasStatus && (
                    <td>
                      <select className="adm-lead-status" value={lead.status} onChange={e => changeStatus(lead, e.target.value)}
                              aria-label={`Status do contato de ${lead.name}`}>
                        {Object.entries(LEAD_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </td>
                  )}
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
