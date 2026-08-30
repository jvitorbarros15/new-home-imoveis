// Admin — listings table

function ListingsView({ onEdit }) {
  const [props, setProps]     = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState("");

  async function load() {
    setLoading(true); setError("");
    const { data, error: err } = await window.sb
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) { setError("Erro ao carregar imóveis. Tente novamente."); setLoading(false); return; }
    setProps(data || []);
    setLoading(false);
  }

  React.useEffect(() => { load(); }, []);

  async function remove(id, code, status, images = []) {
    const msg = status === "active"
      ? `Excluir o imóvel ${code}? Esta ação é permanente e não pode ser desfeita.`
      : `Excluir ${code}? Esta ação é permanente.`;
    if (!confirm(msg)) return;
    if (status === "active" && !confirm(`Confirmar exclusão definitiva de ${code}?`)) return;

    const { error: err } = await window.sb.from("properties").delete().eq("id", id);
    if (err) { alert("Não foi possível excluir. Tente novamente."); return; }
    const marker = "/storage/v1/object/public/property-images/";
    const storagePaths = images
      .filter(url => typeof url === "string" && url.includes(marker))
      .map(url => decodeURIComponent(url.split(marker)[1]));
    if (storagePaths.length) {
      await window.sb.storage.from("property-images").remove(storagePaths);
    }
    setProps(p => p.filter(x => x.id !== id));
  }

  function fmtPrice(cents) {
    if (!cents) return "—";
    return "R$ " + (cents / 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  }

  function statusBadge(s) {
    const map = {
      active: ["adm-badge-active", "Ativo"],
      sold:   ["adm-badge-sold",   "Vendido"],
      rented: ["adm-badge-rented", "Alugado"],
    };
    const [cls, label] = map[s] || ["", s];
    return <span className={`adm-badge ${cls}`}>{label}</span>;
  }

  return (
    <>
      <div className="adm-header">
        <div>
          <h1 className="adm-title">Gestão de <em>imóveis</em></h1>
          <p className="adm-subtitle">
            {loading ? "Carregando..." : `${props.length} listagem${props.length !== 1 ? "s" : ""} cadastrada${props.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={load} aria-label="Recarregar lista">
          Atualizar
        </button>
      </div>

      {error && <div className="adm-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="adm-card">
        {loading ? (
          <div className="adm-loading" role="status" aria-label="Carregando imóveis">
            <div className="adm-spinner" />
          </div>
        ) : props.length === 0 ? (
          <div className="adm-empty">
            <h3>Nenhum imóvel cadastrado</h3>
            <p>Clique em "Novo imóvel" na barra lateral para adicionar o primeiro.</p>
          </div>
        ) : (
          <table className="adm-table" aria-label="Lista de imóveis">
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Foto</th>
                <th scope="col">Título</th>
                <th scope="col">Região</th>
                <th scope="col">Preço</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {props.map(p => (
                <tr key={p.id}>
                  <td>
                    <code style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 4 }}>
                      {p.code}
                    </code>
                  </td>
                  <td>
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, display: "block" }}
                        loading="lazy"
                      />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: 6, background: "var(--adm-border)" }} aria-hidden="true" />
                    )}
                  </td>
                  <td style={{ maxWidth: 260 }}>
                    <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {p.title}
                    </span>
                  </td>
                  <td style={{ color: "var(--adm-ink2)", whiteSpace: "nowrap" }}>{p.region}</td>
                  <td style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{fmtPrice(p.price_brl)}</td>
                  <td>{statusBadge(p.status)}</td>
                  <td>
                    <div className="adm-actions">
                      <button
                        className="adm-btn adm-btn-ghost adm-btn-sm"
                        onClick={() => onEdit(p)}
                        aria-label={`Editar ${p.code}`}
                      >
                        Editar
                      </button>
                      <button
                        className="adm-btn adm-btn-danger adm-btn-sm"
                        onClick={() => remove(p.id, p.code, p.status, p.images)}
                        aria-label={`Excluir ${p.code}`}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
