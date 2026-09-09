// Admin — listings table

const ADM_PAGE_SIZE = 20;
const STORAGE_MARKER = "/storage/v1/object/public/property-images/";

function storagePathsFrom(images) {
  if (!Array.isArray(images)) return [];
  return images.reduce((paths, url) => {
    if (typeof url !== "string" || !url.includes(STORAGE_MARKER)) return paths;
    try {
      paths.push(decodeURIComponent(url.split(STORAGE_MARKER)[1]));
    } catch (e) {
      // A malformed stored URL must not abort the deletion of the others.
    }
    return paths;
  }, []);
}

function ListingsView({ onEdit }) {
  const [props, setProps]     = React.useState([]);
  const [total, setTotal]     = React.useState(0);
  const [page, setPage]       = React.useState(1);
  const [search, setSearch]   = React.useState("");
  const [status, setStatus]   = React.useState("");
  const [query, setQuery]     = React.useState({ search: "", status: "" });
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState("");

  async function load() {
    setLoading(true); setError("");
    const from = (page - 1) * ADM_PAGE_SIZE;
    let request = window.sb
      .from("properties")
      .select("*", { count: "exact" })
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, from + ADM_PAGE_SIZE - 1);

    if (query.status) request = request.eq("status", query.status);
    if (query.search) {
      // PostgREST reads these characters as filter syntax.
      const term = query.search.replace(/[%,()*]/g, " ").trim();
      if (term) request = request.or(`code.ilike.%${term}%,title.ilike.%${term}%,region.ilike.%${term}%`);
    }

    const { data, error: err, count } = await request;
    if (err) { setError("Erro ao carregar imóveis. Tente novamente."); setLoading(false); return; }
    setProps(data || []);
    setTotal(count || 0);
    setLoading(false);
  }

  React.useEffect(() => { load(); }, [page, query]);

  function applyFilters(e) {
    e.preventDefault();
    setPage(1);
    setQuery({ search, status });
  }

  async function remove(id, code, propStatus, images = []) {
    const msg = propStatus === "active"
      ? `Excluir o imóvel ${code}? Esta ação é permanente e não pode ser desfeita.`
      : `Excluir ${code}? Esta ação é permanente.`;
    if (!confirm(msg)) return;
    if (propStatus === "active" && !confirm(`Confirmar exclusão definitiva de ${code}?`)) return;

    // Images go first: if this fails the row survives and the delete can be
    // retried, instead of leaving files with nothing pointing at them.
    const paths = storagePathsFrom(images);
    if (paths.length) {
      const { error: storageErr } = await window.sb.storage.from("property-images").remove(paths);
      if (storageErr) {
        alert("Não foi possível remover as imagens. O imóvel não foi excluído; tente novamente.");
        return;
      }
    }

    const { error: err } = await window.sb.from("properties").delete().eq("id", id);
    if (err) { alert("As imagens foram removidas, mas o imóvel não pôde ser excluído. Tente novamente."); return; }
    setProps(p => p.filter(x => x.id !== id));
    setTotal(t => Math.max(0, t - 1));
  }

  async function toggleFeatured(prop) {
    const next = !prop.featured;
    const { error: err } = await window.sb.from("properties").update({ featured: next }).eq("id", prop.id);
    if (err) { alert("Não foi possível alterar o destaque."); return; }
    setProps(list => list.map(p => (p.id === prop.id ? { ...p, featured: next } : p)));
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

  const pages = Math.max(1, Math.ceil(total / ADM_PAGE_SIZE));

  return (
    <>
      <div className="adm-header">
        <div>
          <h1 className="adm-title">Gestão de <em>imóveis</em></h1>
          <p className="adm-subtitle">
            {loading ? "Carregando..." : `${total} listagem${total !== 1 ? "s" : ""} cadastrada${total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={load} aria-label="Recarregar lista">
          Atualizar
        </button>
      </div>

      <form className="adm-filters" onSubmit={applyFilters} role="search">
        <div className="adm-field">
          <label htmlFor="adm-search">Buscar por código, título ou região</label>
          <input id="adm-search" value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="AP9680, Barra da Tijuca..." autoComplete="off" />
        </div>
        <div className="adm-field">
          <label htmlFor="adm-status">Status</label>
          <select id="adm-status" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Todos</option>
            <option value="active">Ativo</option>
            <option value="sold">Vendido</option>
            <option value="rented">Alugado</option>
          </select>
        </div>
        <button type="submit" className="adm-btn adm-btn-primary adm-btn-sm">Filtrar</button>
        <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm"
                onClick={() => { setSearch(""); setStatus(""); setPage(1); setQuery({ search: "", status: "" }); }}>
          Limpar
        </button>
      </form>

      {error && <div className="adm-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="adm-card">
        {loading ? (
          <div className="adm-loading" role="status" aria-label="Carregando imóveis">
            <div className="adm-spinner" />
          </div>
        ) : props.length === 0 ? (
          <div className="adm-empty">
            <h3>Nenhum imóvel encontrado</h3>
            <p>Ajuste os filtros ou clique em "Novo imóvel" na barra lateral.</p>
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
                <th scope="col">Destaque</th>
                <th scope="col"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {props.map(p => (
                <tr key={p.id}>
                  <td>
                    <code className="adm-code">{p.code}</code>
                  </td>
                  <td>
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt=""
                        width="48"
                        height="48"
                        className="adm-thumb"
                        loading="lazy"
                      />
                    ) : (
                      <div className="adm-thumb adm-thumb-empty" aria-hidden="true" />
                    )}
                  </td>
                  <td className="adm-cell-title">
                    <span className="adm-clamp">{p.title}</span>
                  </td>
                  <td className="adm-cell-region">{p.region}</td>
                  <td className="adm-cell-price">{fmtPrice(p.price_brl)}</td>
                  <td>{statusBadge(p.status)}</td>
                  <td>
                    <button
                      className={`adm-star ${p.featured ? "on" : ""}`}
                      onClick={() => toggleFeatured(p)}
                      aria-pressed={p.featured}
                      aria-label={p.featured ? `Remover ${p.code} dos destaques` : `Destacar ${p.code}`}
                    >
                      ★
                    </button>
                  </td>
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

      {pages > 1 && (
        <nav className="adm-pager" aria-label="Paginação de imóveis">
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
