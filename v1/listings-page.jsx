// Public listing browser: filters, pagination and links into the property page.

const LIST_TYPES = ["Apartamento", "Cobertura", "Casa", "Casa em Condomínio", "Penthouse", "Terreno", "Comercial"];
const LIST_STATUS = [
  { v: "", l: "Todos" },
  { v: "active", l: "À venda" },
  { v: "rented", l: "Para alugar" },
  { v: "sold", l: "Vendidos" },
];
const PAGE_SIZE = 12;

function readFilters() {
  const params = new URLSearchParams(location.search);
  return {
    q: params.get("q") || "",
    code: params.get("code") || "",
    tipo: params.get("tipo") || "",
    status: params.get("status") || "active",
    minPrice: params.get("min") || "",
    maxPrice: params.get("max") || "",
    bedrooms: params.get("quartos") || "",
    page: Math.max(1, parseInt(params.get("p") || "1", 10) || 1),
  };
}

function writeFilters(filters) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.code) params.set("code", filters.code);
  if (filters.tipo) params.set("tipo", filters.tipo);
  if (filters.status) params.set("status", filters.status);
  if (filters.minPrice) params.set("min", filters.minPrice);
  if (filters.maxPrice) params.set("max", filters.maxPrice);
  if (filters.bedrooms) params.set("quartos", filters.bedrooms);
  if (filters.page > 1) params.set("p", String(filters.page));
  const query = params.toString();
  history.replaceState(null, "", query ? `?${query}` : location.pathname);
}

function ListingsPage() {
  const [filters, setFilters] = React.useState(readFilters);
  const [items, setItems] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  useReveal();

  React.useEffect(() => {
    writeFilters(filters);
    if (!window.sb) {
      setError("A base de imóveis não está configurada nesta implantação.");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    const from = (filters.page - 1) * PAGE_SIZE;
    let query = window.sb
      .from("properties")
      .select("code,title,type,region,price_brl,area_m2,bedrooms,suites,parking,images,status,featured", { count: "exact" })
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (filters.status) query = query.eq("status", filters.status);
    if (filters.tipo) query = query.eq("type", filters.tipo);
    if (filters.code) query = query.ilike("code", `%${filters.code}%`);
    if (filters.bedrooms) query = query.gte("bedrooms", parseInt(filters.bedrooms, 10));
    if (filters.minPrice) query = query.gte("price_brl", Math.round(parseFloat(filters.minPrice) * 100));
    if (filters.maxPrice) query = query.lte("price_brl", Math.round(parseFloat(filters.maxPrice) * 100));
    if (filters.q) {
      // PostgREST treats these characters as filter syntax, so they are stripped.
      const term = filters.q.replace(/[%,()*]/g, " ").trim();
      if (term) query = query.or(`title.ilike.%${term}%,region.ilike.%${term}%,address.ilike.%${term}%`);
    }

    query.then(({ data, error: err, count }) => {
      if (!active) return;
      if (err) {
        setError("Não foi possível carregar os imóveis. Tente novamente.");
        setItems([]);
      } else {
        setItems(data || []);
        setTotal(count || 0);
      }
      setLoading(false);
    });

    return () => { active = false; };
  }, [filters]);

  const update = (patch) => setFilters(f => ({ ...f, ...patch, page: 1 }));
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <div className="grain" />
      <Nav />
      <DemoNotice />
      <main className="page" id="conteudo">
        <header className="page-head">
          <span className="eyebrow">Busca</span>
          <h1>Imóveis <em>disponíveis</em></h1>
          <p>Filtre por finalidade, tipo, região, faixa de preço e número de quartos.</p>
        </header>

        <form className="lst-filters" onSubmit={(e) => e.preventDefault()} aria-label="Filtros de busca">
          <div className="lst-field lst-field-wide">
            <label htmlFor="f-q">Região, bairro ou palavra-chave</label>
            <input id="f-q" value={filters.q} onChange={e => update({ q: e.target.value })}
                   placeholder="Barra da Tijuca, varanda gourmet..." />
          </div>
          <div className="lst-field">
            <label htmlFor="f-status">Finalidade</label>
            <select id="f-status" value={filters.status} onChange={e => update({ status: e.target.value })}>
              {LIST_STATUS.map(s => <option key={s.l} value={s.v}>{s.l}</option>)}
            </select>
          </div>
          <div className="lst-field">
            <label htmlFor="f-tipo">Tipo</label>
            <select id="f-tipo" value={filters.tipo} onChange={e => update({ tipo: e.target.value })}>
              <option value="">Todos</option>
              {LIST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="lst-field">
            <label htmlFor="f-quartos">Quartos (mín.)</label>
            <select id="f-quartos" value={filters.bedrooms} onChange={e => update({ bedrooms: e.target.value })}>
              <option value="">Indiferente</option>
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
          <div className="lst-field">
            <label htmlFor="f-min">Preço mínimo</label>
            <input id="f-min" type="number" min="0" step="10000" value={filters.minPrice}
                   onChange={e => update({ minPrice: e.target.value })} placeholder="500000" />
          </div>
          <div className="lst-field">
            <label htmlFor="f-max">Preço máximo</label>
            <input id="f-max" type="number" min="0" step="10000" value={filters.maxPrice}
                   onChange={e => update({ maxPrice: e.target.value })} placeholder="3000000" />
          </div>
          <button type="button" className="lst-clear"
                  onClick={() => setFilters({ q: "", code: "", tipo: "", status: "active", minPrice: "", maxPrice: "", bedrooms: "", page: 1 })}>
            Limpar filtros
          </button>
        </form>

        <p className="lst-count" role="status">
          {loading ? "Buscando..." : `${total} ${total === 1 ? "imóvel encontrado" : "imóveis encontrados"}`}
        </p>

        {error && <div className="lst-error" role="alert">{error}</div>}

        {!loading && !error && items.length === 0 && (
          <div className="lst-empty">
            <h2>Nenhum imóvel corresponde a esses filtros.</h2>
            <p>Ajuste a busca ou fale com a equipe para receber opções fora do site.</p>
            <a className="primary" href={NH.whatsapp("Olá! Não encontrei o que procuro no site. Podem me ajudar?")}
               target="_blank" rel="noopener noreferrer"
               onClick={() => track("whatsapp_click", { detail: "busca_vazia" })}>
              Falar no WhatsApp
            </a>
          </div>
        )}

        <div className="lst-grid">
          {items.map(item => <ListingCard key={item.code} item={item} />)}
        </div>

        {pages > 1 && (
          <nav className="lst-pager" aria-label="Paginação">
            <button type="button" disabled={filters.page <= 1}
                    onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>Anterior</button>
            <span>Página {filters.page} de {pages}</span>
            <button type="button" disabled={filters.page >= pages}
                    onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Próxima</button>
          </nav>
        )}
      </main>
      <Footer />
      <Chat />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ListingsPage />);
