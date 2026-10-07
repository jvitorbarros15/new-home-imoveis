// Admin — traffic and lead metrics

const METRIC_RANGES = [7, 30];
const METRICS_FALLBACK_LIMIT = 5000;
const MISSING_RPC_CODES = ["PGRST202", "42883"];

function dayKey(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function lastDays(days) {
  return Array.from({ length: days }, (_, i) => dayKey(Date.now() - (days - 1 - i) * 24 * 3600 * 1000));
}

function computeMetricsLocally(events, leads) {
  const countBy = (rows, key) => rows.reduce((acc, row) => {
    const value = row[key] || "";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  const named = (name) => events.filter(e => e.name === name);
  const perDay = (rows, keyOf) => {
    const acc = {};
    rows.forEach(row => {
      const day = dayKey(row.created_at);
      acc[day] = acc[day] || { day };
      const key = keyOf(row);
      acc[day][key] = (acc[day][key] || 0) + 1;
    });
    return Object.values(acc).sort((a, b) => a.day.localeCompare(b.day));
  };
  const views = named("property_view");
  const sources = countBy(leads, "utm_source");
  return {
    page_views: views.length,
    top_listings: Object.entries(countBy(views.filter(e => e.property_code), "property_code"))
      .map(([code, count]) => ({ code, views: count })).sort((a, b) => b.views - a.views).slice(0, 10),
    clicks_per_day: perDay(events.filter(e => e.name === "whatsapp_click" || e.name === "phone_click"),
      e => (e.name === "phone_click" ? "phone" : "whatsapp")),
    leads_per_day: perDay(leads, () => "total"),
    leads_by_kind: countBy(leads, "kind"),
    leads_by_source: Object.entries(sources).map(([source, count]) => ({ source: source || "direto", count }))
      .sort((a, b) => b.count - a.count).slice(0, 10),
    chat_completions: named("chat_complete").length,
    js_errors: named("js_error").length,
  };
}

function BarChart({ days, rows, series, label }) {
  const byDay = Object.fromEntries(rows.map(row => [row.day, row]));
  const data = days.map(day => ({ day, values: series.map(s => byDay[day]?.[s.key] || 0) }));
  const max = Math.max(1, ...data.map(d => d.values.reduce((a, b) => a + b, 0)));
  const width = 600;
  const height = 140;
  const slot = width / data.length;
  const total = data.reduce((sum, d) => sum + d.values.reduce((a, b) => a + b, 0), 0);
  const summary = `${label}: ${total} no período. ${series.map((s, i) => `${s.label} ${data.reduce((sum, d) => sum + d.values[i], 0)}`).join(", ")}.`;
  return (
    <div className="adm-chart">
      <svg viewBox={`0 0 ${width} ${height + 18}`} role="img" aria-label={summary} preserveAspectRatio="none">
        {data.map((d, i) => {
          let y = height;
          return (
            <g key={d.day}>
              <title>{`${d.day}: ${d.values.join(" / ")}`}</title>
              {d.values.map((value, si) => {
                const h = (value / max) * (height - 6);
                y -= h;
                return value > 0 ? <rect key={si} className={`adm-bar adm-bar-${si}`} x={i * slot + slot * 0.15} y={y} width={slot * 0.7} height={h} /> : null;
              })}
            </g>
          );
        })}
        <line x1="0" y1={height} x2={width} y2={height} className="adm-chart-axis" />
        <text x="0" y={height + 14} className="adm-chart-text">{data[0].day.slice(5)}</text>
        <text x={width} y={height + 14} textAnchor="end" className="adm-chart-text">{data[data.length - 1].day.slice(5)}</text>
      </svg>
      <div className="adm-chart-legend">
        {series.map((s, i) => <span key={s.key}><i className={`adm-bar-${i}`} />{s.label}</span>)}
      </div>
      <details className="adm-chart-table">
        <summary>Ver tabela</summary>
        <table className="adm-table" aria-label={label}>
          <thead><tr><th scope="col">Dia</th>{series.map(s => <th key={s.key} scope="col">{s.label}</th>)}</tr></thead>
          <tbody>
            {data.filter(d => d.values.some(Boolean)).map(d => (
              <tr key={d.day}><td>{d.day}</td>{d.values.map((v, i) => <td key={i}>{v}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

function RankList({ rows, labelKey, valueKey, empty }) {
  if (!rows.length) return <p className="adm-lead-note">{empty}</p>;
  const max = Math.max(1, ...rows.map(r => r[valueKey]));
  return (
    <ul className="adm-rank">
      {rows.map(row => (
        <li key={row[labelKey]}>
          <span className="adm-rank-label">{row[labelKey]}</span>
          <span className="adm-rank-bar"><i style={{ width: `${(row[valueKey] / max) * 100}%` }} /></span>
          <b>{row[valueKey]}</b>
        </li>
      ))}
    </ul>
  );
}

function MetricsView() {
  const [days, setDays] = React.useState(30);
  const [stats, setStats] = React.useState(null);
  const [partial, setPartial] = React.useState(false);
  const [error, setError] = React.useState("");

  async function load() {
    setStats(null); setError(""); setPartial(false);
    const rpc = await window.sb.rpc("admin_event_stats", { days });
    if (!rpc.error) { setStats(rpc.data); return; }
    if (!MISSING_RPC_CODES.includes(rpc.error.code)) { setError("Não foi possível carregar as métricas."); return; }
    const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
    const [events, leads] = await Promise.all([
      window.sb.from("events").select("name,property_code,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(METRICS_FALLBACK_LIMIT),
      window.sb.from("leads").select("kind,utm_source,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(METRICS_FALLBACK_LIMIT),
    ]);
    if (events.error || leads.error) { setError("Não foi possível carregar as métricas."); return; }
    setPartial((events.data || []).length >= METRICS_FALLBACK_LIMIT || (leads.data || []).length >= METRICS_FALLBACK_LIMIT);
    setStats(computeMetricsLocally(events.data || [], leads.data || []));
  }

  React.useEffect(() => { load(); }, [days]);

  const range = lastDays(days);
  const leadsTotal = stats ? Object.values(stats.leads_by_kind || {}).reduce((a, b) => a + b, 0) : 0;
  const KIND_LABELS = { contact: "Contato", visit: "Visita", seller: "Proprietário" };

  return (
    <>
      <div className="adm-header">
        <div>
          <h1 className="adm-title">Métricas <em>do site</em></h1>
          <p className="adm-subtitle">Visitas, cliques e contatos dos últimos {days} dias</p>
        </div>
        <div className="adm-range" role="group" aria-label="Período">
          {METRIC_RANGES.map(value => (
            <button key={value} type="button" className={`adm-btn adm-btn-sm ${days === value ? "adm-btn-primary" : "adm-btn-ghost"}`}
                    aria-pressed={days === value} onClick={() => setDays(value)}>{value} dias</button>
          ))}
        </div>
      </div>

      {error && <div className="adm-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}
      {partial && <p className="adm-lead-note" role="note" style={{ marginBottom: 12 }}>Mostrando os últimos {METRICS_FALLBACK_LIMIT.toLocaleString("pt-BR")} registros; aplique a migração 016 para totais completos.</p>}
      {!stats && !error && <div className="adm-loading" role="status" aria-label="Carregando métricas"><div className="adm-spinner" /></div>}

      {stats && (
        <>
          <div className="adm-metrics">
            <div className="adm-metric"><span className="adm-metric-value">{stats.page_views}</span><span className="adm-metric-label">Fichas de imóveis abertas</span></div>
            <div className="adm-metric"><span className="adm-metric-value">{leadsTotal}</span><span className="adm-metric-label">Contatos recebidos</span></div>
            <div className="adm-metric"><span className="adm-metric-value">{stats.chat_completions}</span><span className="adm-metric-label">Conversas concluídas no chat</span></div>
            <div className="adm-metric"><span className="adm-metric-value">{stats.js_errors}</span><span className="adm-metric-label">Erros de JavaScript</span></div>
          </div>

          <div className="adm-grid-2">
            <section className="adm-card adm-panel">
              <h2 className="adm-panel-title">Cliques em WhatsApp e telefone por dia</h2>
              <BarChart days={range} rows={stats.clicks_per_day || []} label="Cliques por dia"
                        series={[{ key: "whatsapp", label: "WhatsApp" }, { key: "phone", label: "Telefone" }]} />
            </section>
            <section className="adm-card adm-panel">
              <h2 className="adm-panel-title">Contatos por dia</h2>
              <BarChart days={range} rows={stats.leads_per_day || []} label="Contatos por dia"
                        series={[{ key: "total", label: "Contatos" }]} />
            </section>
          </div>

          <div className="adm-grid-2">
            <section className="adm-card adm-panel">
              <h2 className="adm-panel-title">Imóveis mais vistos</h2>
              <RankList rows={stats.top_listings || []} labelKey="code" valueKey="views" empty="Nenhuma visualização no período." />
            </section>
            <section className="adm-card adm-panel">
              <h2 className="adm-panel-title">Contatos por tipo</h2>
              <RankList rows={Object.entries(stats.leads_by_kind || {}).map(([kind, count]) => ({ kind: KIND_LABELS[kind] || kind, count }))}
                        labelKey="kind" valueKey="count" empty="Nenhum contato no período." />
              <h2 className="adm-panel-title" style={{ marginTop: 22 }}>Contatos por origem</h2>
              <RankList rows={stats.leads_by_source || []} labelKey="source" valueKey="count" empty="Nenhum contato no período." />
            </section>
          </div>
        </>
      )}
    </>
  );
}
