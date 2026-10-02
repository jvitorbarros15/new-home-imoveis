// Property page app shell

function NotFoundProperty({ code }) {
  return <><div className="grain"/><Nav/><DemoNotice/><main className="imovel-page" style={{minHeight:"70vh",display:"grid",placeItems:"center"}}>
    <section className="blk" style={{maxWidth:720,textAlign:"center"}}>
      <span className="eyebrow">{code ? `Imóvel ${code}` : "Imóvel"}</span><h1>{code ? "Não encontramos este imóvel." : "Nenhum imóvel selecionado."}</h1>
      <p>A listagem pode ter sido removida, vendida ou o endereço pode estar incompleto. Veja os imóveis disponíveis ou fale com a equipe.</p>
      <div className="page-cta-actions" style={{justifyContent:"center",marginTop:24}}>
        <a className="btn-primary" href={NH.listingsUrl}>Ver imóveis disponíveis</a>
        <a className="ghost" href={NH.whatsapp(code ? `Olá! Gostaria de informações sobre o imóvel ${code}.` : "Olá! Gostaria de informações sobre imóveis.")} target="_blank" rel="noopener noreferrer">Perguntar no WhatsApp</a>
      </div>
    </section>
  </main><Footer/><Chat/></>;
}

function mapDatabaseProperty(data) {
  const area = data.area_m2 ?? null;
  const price = data.price_brl != null ? data.price_brl / 100 : null;
  const images = Array.isArray(data.images) && data.images.length
    ? data.images.map((src,index) => ({src,caption:`Foto ${index + 1} do imóvel`,room:""}))
    : [];
  const status = data.status === "sold" ? "Vendido" : data.status === "rented" ? "Alugado" : data.purpose === "rent" ? "Para alugar" : data.status === "active" ? "À venda" : "Consulte";
  return {
    ...PROP,
    code: data.code,
    title: data.title,
    type: data.type || "Imóvel",
    status,
    purpose: data.purpose,
    address: data.region || "Rio de Janeiro / RJ",
    region: data.region || "Rio de Janeiro",
    price,
    condominio: data.condominio_brl ? data.condominio_brl / 100 : null,
    iptu: data.iptu_brl ? data.iptu_brl / 100 : null,
    m2Value: price && area ? Math.round(price / area) : null,
    specs: {
      areaUtil: area ?? "—",
      areaBruta: area ?? "—",
      quartos: data.bedrooms ?? "—",
      suites: data.suites ?? "—",
      banheiros: data.bathrooms ?? "—",
      vagas: data.parking ?? "—",
      pet: data.pet_friendly ?? false,
    },
    description: data.description ? data.description.split(/\n\s*\n/).filter(Boolean) : ["Entre em contato para obter a descrição completa deste imóvel."],
    highlights: [],
    features: {},
    nearby: [],
    similar: [],
    images,
    imagesAreIllustrative: false,
    tourUrl: data.tour_url || null,
    officialUrl: null,
  };
}

async function loadSimilar(data) {
  if (!data.price_brl) return [];
  let query = window.sb
    .from("properties")
    .select("code,title,type,region,price_brl,area_m2,bedrooms,parking,purpose")
    .eq("purpose", data.purpose);
  if (data.type) query = query.eq("type", data.type);
  const { data: rows, error } = await query
    .neq("code", data.code)
    .gte("price_brl", Math.round(data.price_brl * 0.7))
    .lte("price_brl", Math.round(data.price_brl * 1.3))
    .order("created_at", { ascending: false })
    .limit(12);
  if (error || !rows) return [];
  return rows
    .sort((a, b) => Number(b.region === data.region) - Number(a.region === data.region))
    .slice(0, 4)
    .map(row => ({ code: row.code, type: row.type, title: row.title, region: row.region, area: row.area_m2, rooms: row.bedrooms, parking: row.parking, price: row.price_brl / 100, purpose: row.purpose }));
}

function ImovelApp() {
  const [theme] = React.useState({motion:"on"});
  const [lightboxOpen,setLightboxOpen] = React.useState(false);
  const [lightboxIndex,setLightboxIndex] = React.useState(0);
  const [prop,setProp] = React.useState(null);
  const [loading,setLoading] = React.useState(true);
  const [notFound,setNotFound] = React.useState("");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-motion",theme.motion);
  },[theme.motion]);
  useReveal();

  React.useEffect(() => {
    const requestedCode = new URLSearchParams(location.search).get("code")?.trim();
    if (!requestedCode || !window.sb) { setNotFound(requestedCode || " "); setLoading(false); return; }
    window.sb.from("properties").select("code,title,type,region,price_brl,area_m2,bedrooms,suites,bathrooms,parking,images,status,purpose,description,tour_url,pet_friendly,condominio_brl,iptu_brl").eq("code",requestedCode).maybeSingle()
      .then(({data,error}) => {
        if (error || !data) setNotFound(requestedCode);
        else {
          setProp(mapDatabaseProperty(data));
          track("property_view", { code: data.code });
          loadSimilar(data).then(similar => setProp(current => current && { ...current, similar }));
        }
      })
      .catch(() => setNotFound(requestedCode))
      .finally(() => setLoading(false));
  },[]);

  React.useEffect(() => {
    if (!prop) { document.title = "Imóvel não encontrado | New Home Imóveis"; return; }
    document.title = `${prop.title} | New Home Imóveis`;
    const description = `${prop.type} em ${prop.region}. Código ${prop.code}. Consulte disponibilidade e condições com a New Home Imóveis.`;
    document.querySelector('meta[name="description"]')?.setAttribute("content",description);
  },[prop]);

  if (loading) return <div role="status" aria-label="Carregando imóvel" style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"var(--bg)"}}><div style={{width:32,height:32,borderRadius:"50%",border:"2px solid var(--line-2)",borderTopColor:"var(--accent)",animation:"spin .7s linear infinite"}}/></div>;
  if (notFound || !prop) return <NotFoundProperty code={notFound.trim()}/>;
  const openLightbox = (index) => { setLightboxIndex(index); setLightboxOpen(true); };

  return <><div className="grain"/><Nav/><DemoNotice/>
    <main className="imovel-page">
      <nav className="crumb" aria-label="Navegação estrutural"><a href="/">Home</a><span className="crumb-sep">›</span><a href={NH.listingsUrl}>Imóveis</a><span className="crumb-sep">›</span><span className="crumb-now">{prop.code}</span></nav>
      <GalleryHero prop={prop} onOpen={openLightbox}/><Identity prop={prop}/>
      <div className="body-grid"><div className="body-main">
        <div className="reveal"><Description prop={prop}/></div>
        <div className="reveal"><Highlights prop={prop}/></div>
        <div className="reveal"><Features prop={prop}/></div>
        <div className="reveal"><Localizacao prop={prop}/></div>
        <div className="reveal"><Custos prop={prop}/></div>
      </div><Sidebar prop={prop}/></div>
      <Similar prop={prop}/>
    </main>
    <StickyContact prop={prop}/><Footer/><Chat/>
    <Lightbox open={lightboxOpen} idx={lightboxIndex} setIdx={setLightboxIndex} onClose={() => setLightboxOpen(false)} images={prop.images}/>
  </>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<ImovelApp/>);
