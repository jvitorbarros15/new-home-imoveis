// Public listing browser: filters, pagination and links into the property page.

const LIST_TYPES = PROPERTY_TYPES;
const LIST_PURPOSE = [
  { v: "", l: "Todas" },
  { v: "sale", l: "Venda" },
  { v: "rent", l: "Aluguel" },
];
const PAGE_SIZE = 12;
const LISTING_CODE_PATTERN = /^[A-Z]{2}\d{4}-NHB$/i;

function readFilters() {
  const params = new URLSearchParams(location.search);
  return {
    q: params.get("q") || "",
    code: params.get("code") || "",
    tipo: params.get("tipo") || "",
    purpose: params.get("purpose") || (params.get("status") === "rented" ? "rent" : ""),
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
  if (filters.purpose) params.set("purpose", filters.purpose);
  if (filters.minPrice) params.set("min", filters.minPrice);
  if (filters.maxPrice) params.set("max", filters.maxPrice);
  if (filters.bedrooms) params.set("quartos", filters.bedrooms);
  if (filters.page > 1) params.set("p", String(filters.page));
  const query = params.toString();
  history.replaceState(null, "", query ? `?${query}` : location.pathname);
}

const EMPTY_FILTERS = { tipo: "", purpose: "", minPrice: "", maxPrice: "", bedrooms: "" };
const brlShort = (value) => `R$ ${Number(value).toLocaleString("pt-BR")}`;

function PriceInput({ id, value, onCommit, placeholder, debounce }) {
  const [draft, setDraft] = React.useState(null);
  React.useEffect(() => setDraft(null), [value]);
  React.useEffect(() => {
    if (draft === null || draft === value) return;
    const timer = setTimeout(() => onCommit(draft), 300);
    return () => clearTimeout(timer);
  }, [draft]);
  return (
    <input id={id} inputMode="numeric" autoComplete="off" value={formatBRLInput(draft ?? value)} placeholder={placeholder}
           onChange={e => {
             const next = String(parseBRL(e.target.value) ?? "");
             if (debounce) setDraft(next);
             else onCommit(next);
           }} />
  );
}

function ListingsPage() {
  const [filters, setFilters] = React.useState(readFilters);
  const [items, setItems] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [qText, setQText] = React.useState(filters.q);
  const [draft, setDraft] = React.useState(filters);
  const sheetRef = React.useRef(null);

  useReveal();

  React.useEffect(() => {
    if (qText === filters.q) return;
    const timer = setTimeout(() => setFilters(f => ({ ...f, q: qText, page: 1 })), 300);
    return () => clearTimeout(timer);
  }, [qText]);

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
      .select("code,title,type,region,price_brl,area_m2,bedrooms,suites,parking,images,status,purpose,featured", { count: "exact" })
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    query = query.eq("status", "active");
    if (filters.purpose) query = query.eq("purpose", filters.purpose);
    if (filters.tipo) query = query.eq("type", filters.tipo);
    if (filters.code) query = query.ilike("code", `%${filters.code}%`);
    if (filters.bedrooms) query = query.gte("bedrooms", parseInt(filters.bedrooms, 10));
    if (filters.minPrice) query = query.gte("price_brl", Math.round(parseFloat(filters.minPrice) * 100));
    if (filters.maxPrice) query = query.lte("price_brl", Math.round(parseFloat(filters.maxPrice) * 100));
    if (filters.q) {
      // PostgREST treats these characters as filter syntax, so they are stripped.
      const term = filters.q.replace(/[%,()*]/g, " ").trim();
      if (LISTING_CODE_PATTERN.test(term)) query = query.ilike("code", term);
      else if (term) query = query.or(`title.ilike.%${term}%,region.ilike.%${term}%`);
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

  React.useEffect(() => {
    if (loading || error) return;
    const last = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (filters.page > last) setFilters(f => ({ ...f, page: last }));
  }, [loading, error, total]);

  const update = (patch) => setFilters(f => ({ ...f, ...patch, page: 1 }));
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const clearAll = () => { setQText(""); setFilters({ q: "", code: "", ...EMPTY_FILTERS, page: 1 }); };
  const openSheet = () => {
    setDraft(filters);
    document.body.style.overflow = "hidden";
    sheetRef.current.showModal();
  };
  const applySheet = () => {
    update({ tipo: draft.tipo, purpose: draft.purpose, bedrooms: draft.bedrooms, minPrice: draft.minPrice, maxPrice: draft.maxPrice });
    sheetRef.current.close();
  };

  const chips = [];
  if (filters.purpose) chips.push({ key: "purpose", label: LIST_PURPOSE.find(p => p.v === filters.purpose)?.l || filters.purpose, clear: { purpose: "", minPrice: "", maxPrice: "" } });
  if (filters.tipo) chips.push({ key: "tipo", label: filters.tipo, clear: { tipo: "" } });
  if (filters.bedrooms) chips.push({ key: "bedrooms", label: `${filters.bedrooms}+ quartos`, clear: { bedrooms: "" } });
  if (filters.minPrice || filters.maxPrice) {
    const label = filters.minPrice && filters.maxPrice ? `${brlShort(filters.minPrice)} a ${brlShort(filters.maxPrice)}`
      : filters.minPrice ? `A partir de ${brlShort(filters.minPrice)}` : `Até ${brlShort(filters.maxPrice)}`;
    chips.push({ key: "price", label, clear: { minPrice: "", maxPrice: "" } });
  }
  const activeCount = chips.length;

  const filterFields = (prefix, values, set, debounce) => {
    const bands = PRICE_BANDS[values.purpose];
    return (
      <>
        <div className="lst-field">
          <label htmlFor={`${prefix}-purpose`}>Finalidade</label>
          <select id={`${prefix}-purpose`} value={values.purpose} onChange={e => set({ purpose: e.target.value, minPrice: "", maxPrice: "" })}>
            {LIST_PURPOSE.map(s => <option key={s.l} value={s.v}>{s.l}</option>)}
          </select>
        </div>
        <div className="lst-field">
          <label htmlFor={`${prefix}-tipo`}>Tipo</label>
          <select id={`${prefix}-tipo`} value={values.tipo} onChange={e => set({ tipo: e.target.value })}>
            <option value="">Todos</option>
            {LIST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="lst-field">
          <label htmlFor={`${prefix}-quartos`}>Quartos (mín.)</label>
          <select id={`${prefix}-quartos`} value={values.bedrooms} onChange={e => set({ bedrooms: e.target.value })}>
            <option value="">Indiferente</option>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+</option>)}
          </select>
        </div>
        <div className="lst-field">
          <label htmlFor={`${prefix}-min`}>Preço mínimo</label>
          <PriceInput id={`${prefix}-min`} value={values.minPrice} placeholder="Mínimo" debounce={debounce}
                      onCommit={v => set({ minPrice: v })} />
        </div>
        <div className="lst-field">
          <label htmlFor={`${prefix}-max`}>Preço máximo</label>
          <PriceInput id={`${prefix}-max`} value={values.maxPrice} placeholder="Máximo" debounce={debounce}
                      onCommit={v => set({ maxPrice: v })} />
        </div>
        {bands && (
          <div className="lst-bands" role="group" aria-label="Faixas de preço">
            {bands.map(band => {
              const on = values.minPrice === String(band.min) && values.maxPrice === String(band.max);
              return (
                <button key={band.label} type="button" className={`lst-band ${on ? "on" : ""}`} aria-pressed={on}
                        onClick={() => set(on ? { minPrice: "", maxPrice: "" } : { minPrice: String(band.min), maxPrice: String(band.max) })}>
                  {band.label}
                </button>
              );
            })}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="grain" />
      <Nav />
      <DemoNotice />
      <main className="page" id="conteudo">
        <header className="page-head lst-head">
          <span className="eyebrow">Busca</span>
          <h1>Imóveis <em>disponíveis</em></h1>
          <p>Filtre por finalidade, tipo, região, faixa de preço e número de quartos.</p>
        </header>

        <form className="lst-filters" onSubmit={(e) => e.preventDefault()} aria-label="Filtros de busca">
          <div className="lst-field lst-field-wide">
            <label htmlFor="f-q">Região, bairro ou palavra-chave</label>
            <input id="f-q" value={qText} onChange={e => setQText(e.target.value)}
                   placeholder="Barra da Tijuca, varanda gourmet..." />
          </div>
          <div className="lst-more">
            {filterFields("f", filters, update, true)}
            <button type="button" className="lst-clear" onClick={clearAll}>Limpar filtros</button>
          </div>
        </form>

        <div className="lst-bar">
          <button type="button" className="lst-open-sheet" onClick={openSheet}><IconFilter size={14} /> Filtros{activeCount > 0 ? ` (${activeCount})` : ""}</button>
          <p className="lst-count" role="status">
            {loading ? "Buscando..." : error ? "" : `${total} ${total === 1 ? "imóvel encontrado" : "imóveis encontrados"}`}
          </p>
        </div>

        {chips.length > 0 && (
          <div className="lst-chips">
            {chips.map(chip => (
              <button key={chip.key} type="button" className="lst-chip" aria-label={`Remover filtro: ${chip.label}`} onClick={() => update(chip.clear)}>
                {chip.label} <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        )}

        <dialog ref={sheetRef} className="lst-sheet" aria-labelledby="sheet-title"
                onClose={() => { document.body.style.overflow = ""; }}
                onClick={(e) => { if (e.target === sheetRef.current) sheetRef.current.close(); }}>
          <div className="lst-sheet-body">
            <div className="lst-sheet-head">
              <h2 id="sheet-title">Filtros</h2>
              <button type="button" className="lst-sheet-close" aria-label="Fechar filtros" onClick={() => sheetRef.current.close()}><IconX size={18} /></button>
            </div>
            <div className="lst-sheet-fields">{filterFields("s", draft, (patch) => setDraft(d => ({ ...d, ...patch })))}</div>
            <div className="lst-sheet-foot">
              <button type="button" className="lst-clear" onClick={() => setDraft(d => ({ ...d, ...EMPTY_FILTERS }))}>Limpar</button>
              <button type="button" className="btn-primary" onClick={applySheet}>Aplicar</button>
            </div>
          </div>
        </dialog>

        {error && <div className="lst-error" role="alert">{error}</div>}

        {!loading && !error && items.length === 0 && (
          <div className="lst-empty">
            <h2>Nenhum imóvel corresponde a esses filtros.</h2>
            <p>Ajuste a busca ou fale com a equipe para receber opções fora do site.</p>
            <a className="btn-primary" href={NH.whatsapp("Olá! Não encontrei o que procuro no site. Podem me ajudar?")}
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
