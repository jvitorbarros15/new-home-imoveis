// Favourites saved in this browser, resolved against the live listing data.

function readFavoriteCodes() {
  try {
    return Object.keys(localStorage)
      .filter(key => key.startsWith("favorite:") && localStorage.getItem(key) === "1")
      .map(key => key.slice("favorite:".length))
      .filter(Boolean)
      .slice(0, 100);
  } catch (e) {
    return [];
  }
}

function FavoritesPage() {
  const [codes, setCodes] = React.useState(readFavoriteCodes);
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  useReveal();

  React.useEffect(() => {
    if (codes.length === 0) { setItems([]); setLoading(false); return; }
    if (!window.sb) {
      setError("A base de imóveis não está configurada nesta implantação.");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    window.sb
      .from("properties")
      .select("code,title,type,region,price_brl,area_m2,bedrooms,suites,parking,images,status")
      .in("code", codes)
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) setError("Não foi possível carregar os favoritos.");
        else setItems(data || []);
        setLoading(false);
      });
    return () => { active = false; };
  }, [codes]);

  function remove(code) {
    try { localStorage.removeItem(`favorite:${code}`); } catch (e) { /* storage blocked */ }
    track("favorite_remove", { code, detail: "favoritos" });
    setCodes(readFavoriteCodes());
  }

  const missing = codes.filter(code => !items.some(item => item.code === code));

  return (
    <>
      <div className="grain" />
      <Nav />
      <DemoNotice />
      <main className="page" id="conteudo">
        <header className="page-head">
          <span className="eyebrow">Sua seleção</span>
          <h1>Imóveis <em>favoritos</em></h1>
          <p>Salvos apenas neste navegador. Limpar os dados do site remove a lista.</p>
        </header>

        {error && <div className="lst-error" role="alert">{error}</div>}

        {!loading && codes.length === 0 && (
          <div className="lst-empty">
            <h2>Você ainda não salvou nenhum imóvel.</h2>
            <p>Use o ícone de coração na página de um imóvel para guardá-lo aqui.</p>
            <a className="primary" href={NH.listingsUrl}>Ver imóveis</a>
          </div>
        )}

        <p className="lst-count" role="status">
          {loading ? "Carregando..." : codes.length > 0 ? `${items.length} de ${codes.length} disponíveis` : ""}
        </p>

        <div className="lst-grid">
          {items.map(item => (
            <div key={item.code} className="fav-wrap">
              <ListingCard item={item} />
              <button type="button" className="fav-remove" onClick={() => remove(item.code)}
                      aria-label={`Remover ${item.code} dos favoritos`}>
                Remover
              </button>
            </div>
          ))}
        </div>

        {missing.length > 0 && !loading && (
          <p className="fav-missing">
            {missing.length} imóvel(is) salvo(s) não está(ão) mais disponível(is): {missing.join(", ")}.{" "}
            <a href={NH.whatsapp("Olá! Tenho interesse em imóveis que saíram do site. Podem me ajudar?")}
               target="_blank" rel="noopener noreferrer"
               onClick={() => track("whatsapp_click", { detail: "favoritos_indisponiveis" })}>
              Perguntar sobre eles
            </a>
          </p>
        )}
      </main>
      <Footer />
      <Chat />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<FavoritesPage />);
