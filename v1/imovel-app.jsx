// Property page app shell

function NotFoundProperty({ code }) {
  const officialUrl = `${NH.inventoryUrl}?codigo=${encodeURIComponent(code)}`;
  return <><div className="grain"/><Nav/><main className="imovel-page" style={{minHeight:"70vh",display:"grid",placeItems:"center"}}>
    <section className="blk" style={{maxWidth:720,textAlign:"center"}}>
      <span className="eyebrow">Imóvel {code}</span><h1>Não foi possível carregar este imóvel.</h1>
      <p>A listagem pode ter sido removida, vendida ou ainda não estar sincronizada com este site.</p>
      <div className="page-cta-actions" style={{justifyContent:"center",marginTop:24}}>
        <a className="primary" href={officialUrl} target="_blank" rel="noopener noreferrer">Procurar no portal oficial</a>
        <a className="ghost" href={NH.whatsapp(`Olá! Gostaria de informações sobre o imóvel ${code}.`)} target="_blank" rel="noopener noreferrer">Perguntar no WhatsApp</a>
      </div>
    </section>
  </main><Footer/><Chat/></>;
}

function mapDatabaseProperty(data) {
  const area = data.area_m2 ?? null;
  const price = data.price_brl != null ? data.price_brl / 100 : null;
  const defaultImages = PROP.images;
  const images = Array.isArray(data.images) && data.images.length
    ? data.images.map((src,index) => ({src,caption:`Foto ${index + 1} do imóvel`,room:""}))
    : defaultImages;
  const status = {active:"À venda",sold:"Vendido",rented:"Alugado"}[data.status] || "Consulte";
  return {
    ...PROP,
    code: data.code,
    title: data.title,
    type: data.type || "Imóvel",
    status,
    address: data.address || data.region || "Rio de Janeiro / RJ",
    region: data.region || "Rio de Janeiro",
    price,
    condominio: data.condominio_brl != null ? data.condominio_brl / 100 : null,
    iptu: data.iptu_brl != null ? data.iptu_brl / 100 : null,
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
    imagesAreIllustrative: !(Array.isArray(data.images) && data.images.length),
    tourUrl: data.tour_url || null,
    officialUrl: `${NH.inventoryUrl}?codigo=${encodeURIComponent(data.code)}`,
  };
}

function ImovelApp() {
  const [theme] = React.useState({motion:"on"});
  const [lightboxOpen,setLightboxOpen] = React.useState(false);
  const [lightboxIndex,setLightboxIndex] = React.useState(0);
  const [prop,setProp] = React.useState(PROP);
  const [loading,setLoading] = React.useState(false);
  const [notFound,setNotFound] = React.useState("");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-motion",theme.motion);
  },[theme.motion]);
  useReveal();

  React.useEffect(() => {
    const requestedCode = new URLSearchParams(location.search).get("code")?.trim();
    if (!requestedCode || requestedCode.toUpperCase() === PROP.code) return;
    if (!window.sb) { setNotFound(requestedCode); return; }
    setLoading(true);
    window.sb.from("properties").select("*").eq("code",requestedCode).maybeSingle()
      .then(({data,error}) => {
        if (error || !data) setNotFound(requestedCode);
        else setProp(mapDatabaseProperty(data));
      })
      .catch(() => setNotFound(requestedCode))
      .finally(() => setLoading(false));
  },[]);

  React.useEffect(() => {
    document.title = `${prop.title} | New Home Imóveis`;
    const description = `${prop.type} em ${prop.region}. Código ${prop.code}. Consulte disponibilidade e condições com a New Home Imóveis.`;
    document.querySelector('meta[name="description"]')?.setAttribute("content",description);
  },[prop]);

  if (loading) return <div role="status" aria-label="Carregando imóvel" style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"var(--bg)"}}><div style={{width:32,height:32,borderRadius:"50%",border:"2px solid var(--line-2)",borderTopColor:"var(--accent)",animation:"spin .7s linear infinite"}}/></div>;
  if (notFound) return <NotFoundProperty code={notFound}/>;
  const openLightbox = (index) => { setLightboxIndex(index); setLightboxOpen(true); };

  return <><div className="grain"/><Nav/>
    <main className="imovel-page">
      <nav className="crumb" aria-label="Navegação estrutural"><a href="index.html">Home</a><span className="crumb-sep">›</span><a href={NH.inventoryUrl} target="_blank" rel="noopener noreferrer">Imóveis</a><span className="crumb-sep">›</span><span className="crumb-now">{prop.code}</span></nav>
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
    <Footer/><Chat/>
    <Lightbox open={lightboxOpen} idx={lightboxIndex} setIdx={setLightboxIndex} onClose={() => setLightboxOpen(false)} images={prop.images}/>
  </>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<ImovelApp/>);
